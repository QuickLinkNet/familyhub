<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

use FamilyCompass\Config\Config;
use PDO;
use Throwable;
use ZipArchive;

final class PortableArchiveService
{
    private const FORMAT_VERSION = 1;
    private const MAX_UPLOAD_SIZE = 268_435_456;
    private const MAX_ARCHIVE_FILES = 32;
    private const MAX_EXTRACTED_SIZE = 268_435_456;
    private const PHOTO_MIMES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    private const KEY_FILES = ['calendar-source.key', 'application-secrets.key'];

    public function __construct(
        private Config $config,
        private Logger $logger,
        private BackupService $backups
    ) {}

    /** @return array{path: string, name: string, size: int, photoCount: int, includesSecrets: bool} */
    public function create(PDO $database): array
    {
        $this->requireZip();
        $directory = $this->config->backupsPath();
        $this->ensureDirectory($directory);
        $token = bin2hex(random_bytes(4));
        $snapshot = $directory . DIRECTORY_SEPARATOR . '.archive-' . $token . '.sqlite';
        $name = sprintf('familyhub-%s-%s.familyhub', gmdate('Ymd-His'), $token);
        $archivePath = $directory . DIRECTORY_SEPARATOR . '.' . $name . '.tmp';

        try {
            $quoted = $database->quote($snapshot);
            if ($quoted === false) { throw new AppException('ARCHIVE_FAILED', 'Die Datenbankkopie konnte nicht vorbereitet werden.'); }
            $database->exec('VACUUM INTO ' . $quoted);
            $this->backups->validateDatabase($snapshot);
            $photos = $this->activePhotos($snapshot);
            $files = ['database/app.sqlite' => $this->fileMetadata($snapshot, 'database')];

            foreach ($photos as $photo) {
                $path = $this->photoPath($photo);
                $files['photos/' . $photo['stored_name']] = $this->fileMetadata($path, 'photo');
            }
            foreach (self::KEY_FILES as $keyName) {
                $keyPath = $this->keyPath($keyName);
                if (is_file($keyPath)) { $files['keys/' . $keyName] = $this->fileMetadata($keyPath, 'secret'); }
            }

            $manifest = [
                'format' => 'familyhub-portable-archive',
                'formatVersion' => self::FORMAT_VERSION,
                'appVersion' => $this->config->version(),
                'exportedAt' => gmdate('c'),
                'photoCount' => count($photos),
                'includesSecrets' => count(array_filter(array_keys($files), static fn (string $entry): bool => str_starts_with($entry, 'keys/'))) > 0,
                'files' => $files,
            ];

            $zip = new ZipArchive();
            if ($zip->open($archivePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new AppException('ARCHIVE_FAILED', 'Das Familienarchiv konnte nicht erstellt werden.');
            }
            foreach (array_keys($files) as $entry) {
                $source = $entry === 'database/app.sqlite' ? $snapshot : (
                    str_starts_with($entry, 'photos/')
                        ? $this->config->wallPhotosPath() . DIRECTORY_SEPARATOR . basename($entry)
                        : $this->keyPath(basename($entry))
                );
                if (!$zip->addFile($source, $entry)) { $zip->close(); throw new AppException('ARCHIVE_FAILED', 'Eine Archivdatei konnte nicht hinzugefügt werden.'); }
            }
            $json = json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
            if (!$zip->addFromString('manifest.json', $json) || !$zip->close()) {
                throw new AppException('ARCHIVE_FAILED', 'Das Familienarchiv konnte nicht abgeschlossen werden.');
            }
            $size = filesize($archivePath);
            if ($size === false || $size < 1) { throw new AppException('ARCHIVE_FAILED', 'Das Familienarchiv ist leer.'); }
            $this->logger->info('Portable family archive created', ['photos' => count($photos), 'size' => $size]);
            return ['path' => $archivePath, 'name' => $name, 'size' => $size, 'photoCount' => count($photos), 'includesSecrets' => $manifest['includesSecrets']];
        } catch (AppException $exception) {
            @unlink($archivePath);
            throw $exception;
        } catch (Throwable $exception) {
            @unlink($archivePath);
            throw new AppException('ARCHIVE_FAILED', 'Das Familienarchiv konnte nicht erstellt werden.');
        } finally {
            @unlink($snapshot);
        }
    }

    /** @param array<string, mixed> $file @return array<string, mixed> */
    public function scheduleUpload(array $file, PDO $database): array
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        $size = (int) ($file['size'] ?? 0);
        $temporary = (string) ($file['tmp_name'] ?? '');
        $name = basename((string) ($file['name'] ?? ''));
        $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if ($error !== UPLOAD_ERR_OK || $size < 1 || $size > self::MAX_UPLOAD_SIZE || !is_uploaded_file($temporary)) {
            throw new AppException('VALIDATION_ERROR', 'Bitte ein FamilyHub-Archiv mit höchstens 256 MB auswählen.', 422);
        }
        if (!in_array($extension, ['familyhub', 'zip'], true)) {
            throw new AppException('VALIDATION_ERROR', 'Die Archivdatei muss auf .familyhub oder .zip enden.', 422);
        }
        return $this->scheduleFile($temporary, $database, $name);
    }

    /** @return array<string, mixed> */
    public function scheduleFile(string $archivePath, PDO $database, ?string $originalName = null): array
    {
        $this->requireZip();
        $pending = $this->config->archiveRestorePath();
        if (is_dir($pending)) { throw new AppException('ARCHIVE_RESTORE_PENDING', 'Es ist bereits eine Archiv-Wiederherstellung vorbereitet.', 409); }
        $temporary = $pending . '.tmp-' . bin2hex(random_bytes(3));
        try {
            $metadata = $this->extractAndValidate($archivePath, $temporary);
            $this->backups->create('before-archive-restore', $database);
            if (!rename($temporary, $pending)) { throw new AppException('RESTORE_FAILED', 'Das Familienarchiv konnte nicht bereitgestellt werden.'); }
            $this->logger->warning('Portable family archive restore scheduled', ['source' => mb_substr($originalName ?? basename($archivePath), 0, 180)]);
            return $metadata + ['pendingRestore' => true, 'name' => mb_substr($originalName ?? basename($archivePath), 0, 180)];
        } catch (Throwable $exception) {
            $this->removeTree($temporary);
            if ($exception instanceof AppException) { throw $exception; }
            throw new AppException('INVALID_ARCHIVE', 'Das Familienarchiv konnte nicht geprüft werden.', 422);
        }
    }

    public function applyPendingRestore(): void
    {
        $pending = $this->config->archiveRestorePath();
        if (!is_dir($pending)) { return; }
        $this->validateStaged($pending);
        $rollback = $this->config->storagePath() . DIRECTORY_SEPARATOR . 'archive-restore.rollback-' . bin2hex(random_bytes(3));
        $this->ensureDirectory($rollback . DIRECTORY_SEPARATOR . 'keys');
        $database = $this->config->databasePath();
        $photos = $this->config->wallPhotosPath();
        $movedKeys = [];
        $newKeys = [];
        $oldDatabaseMoved = false;
        $oldPhotosMoved = false;
        $newDatabaseInstalled = false;
        $newPhotosInstalled = false;

        try {
            if (is_file($database)) { $oldDatabaseMoved = rename($database, $rollback . DIRECTORY_SEPARATOR . 'app.sqlite'); if (!$oldDatabaseMoved) { throw new AppException('RESTORE_FAILED', 'Die bestehende Datenbank konnte nicht gesichert werden.'); } }
            if (is_dir($photos)) { $oldPhotosMoved = rename($photos, $rollback . DIRECTORY_SEPARATOR . 'wall-photos'); if (!$oldPhotosMoved) { throw new AppException('RESTORE_FAILED', 'Die bestehenden Familienfotos konnten nicht gesichert werden.'); } }
            foreach (self::KEY_FILES as $keyName) {
                $incoming = $pending . DIRECTORY_SEPARATOR . 'keys' . DIRECTORY_SEPARATOR . $keyName;
                $current = $this->keyPath($keyName);
                if (!is_file($incoming)) { continue; }
                if (is_file($current)) {
                    if (!rename($current, $rollback . DIRECTORY_SEPARATOR . 'keys' . DIRECTORY_SEPARATOR . $keyName)) { throw new AppException('RESTORE_FAILED', 'Ein Verbindungsschlüssel konnte nicht gesichert werden.'); }
                    $movedKeys[] = $keyName;
                }
            }
            $newDatabaseInstalled = rename($pending . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'app.sqlite', $database);
            if (!$newDatabaseInstalled) { throw new AppException('RESTORE_FAILED', 'Die Archivdatenbank konnte nicht aktiviert werden.'); }
            $newPhotosInstalled = rename($pending . DIRECTORY_SEPARATOR . 'photos', $photos);
            if (!$newPhotosInstalled) { throw new AppException('RESTORE_FAILED', 'Die Familienfotos konnten nicht aktiviert werden.'); }
            foreach (self::KEY_FILES as $keyName) {
                $incoming = $pending . DIRECTORY_SEPARATOR . 'keys' . DIRECTORY_SEPARATOR . $keyName;
                if (!is_file($incoming)) { continue; }
                if (!rename($incoming, $this->keyPath($keyName))) { throw new AppException('RESTORE_FAILED', 'Ein Verbindungsschlüssel konnte nicht aktiviert werden.'); }
                $newKeys[] = $keyName;
            }
            $this->removeTree($pending);
            $this->removeTree($rollback);
            $this->logger->info('Portable family archive restore applied');
        } catch (Throwable $exception) {
            if ($newDatabaseInstalled) { @unlink($database); }
            if ($newPhotosInstalled) { $this->removeTree($photos); }
            foreach ($newKeys as $keyName) { @unlink($this->keyPath($keyName)); }
            $rollbackComplete = true;
            if ($oldDatabaseMoved && !@rename($rollback . DIRECTORY_SEPARATOR . 'app.sqlite', $database)) { $rollbackComplete = false; }
            if ($oldPhotosMoved && !@rename($rollback . DIRECTORY_SEPARATOR . 'wall-photos', $photos)) { $rollbackComplete = false; }
            foreach ($movedKeys as $keyName) {
                if (!@rename($rollback . DIRECTORY_SEPARATOR . 'keys' . DIRECTORY_SEPARATOR . $keyName, $this->keyPath($keyName))) { $rollbackComplete = false; }
            }
            if ($rollbackComplete) { $this->removeTree($rollback); }
            else { throw new AppException('RESTORE_FAILED', 'Die Archiv-Wiederherstellung wurde gestoppt. Die Rückrolldaten bleiben im geschützten Speicher erhalten.'); }
            if ($exception instanceof AppException) { throw $exception; }
            throw new AppException('RESTORE_FAILED', 'Das Familienarchiv konnte nicht aktiviert werden.');
        }
    }

    /** @return array<string, mixed> */
    private function extractAndValidate(string $archivePath, string $target): array
    {
        $zip = new ZipArchive();
        if ($zip->open($archivePath) !== true || $zip->numFiles < 2 || $zip->numFiles > self::MAX_ARCHIVE_FILES) {
            throw new AppException('INVALID_ARCHIVE', 'Die Datei ist kein gültiges FamilyHub-Archiv.', 422);
        }
        try {
            $manifestRaw = $zip->getFromName('manifest.json');
            if (!is_string($manifestRaw) || strlen($manifestRaw) > 131_072) { throw new AppException('INVALID_ARCHIVE', 'Das Archivmanifest fehlt oder ist ungültig.', 422); }
            $manifest = json_decode($manifestRaw, true, 32, JSON_THROW_ON_ERROR);
            if (!is_array($manifest) || ($manifest['format'] ?? null) !== 'familyhub-portable-archive' || ($manifest['formatVersion'] ?? null) !== self::FORMAT_VERSION || !is_array($manifest['files'] ?? null)) {
                throw new AppException('INVALID_ARCHIVE', 'Das Archivformat wird von dieser FamilyHub-Version nicht unterstützt.', 422);
            }
            $declared = $manifest['files'];
            if (!isset($declared['database/app.sqlite']) || count($declared) !== $zip->numFiles - 1) { throw new AppException('INVALID_ARCHIVE', 'Das Archivmanifest ist unvollständig.', 422); }
            $this->ensureDirectory($target . DIRECTORY_SEPARATOR . 'database');
            $this->ensureDirectory($target . DIRECTORY_SEPARATOR . 'photos');
            $this->ensureDirectory($target . DIRECTORY_SEPARATOR . 'keys');
            $seen = [];
            $total = 0;
            for ($index = 0; $index < $zip->numFiles; $index++) {
                $entry = $zip->getNameIndex($index);
                if ($entry === 'manifest.json') { continue; }
                if (!is_string($entry) || !$this->allowedEntry($entry) || isset($seen[$entry]) || !isset($declared[$entry]) || !is_array($declared[$entry])) {
                    throw new AppException('INVALID_ARCHIVE', 'Das Archiv enthält eine unerlaubte Datei.', 422);
                }
                $stat = $zip->statIndex($index);
                $size = is_array($stat) ? (int) ($stat['size'] ?? -1) : -1;
                $expectedSize = (int) ($declared[$entry]['size'] ?? -2);
                $expectedHash = strtolower((string) ($declared[$entry]['sha256'] ?? ''));
                $total += max(0, $size);
                if ($size < 1 || $size !== $expectedSize || $total > self::MAX_EXTRACTED_SIZE || preg_match('/^[a-f0-9]{64}$/', $expectedHash) !== 1) {
                    throw new AppException('INVALID_ARCHIVE', 'Eine Archivdatei hat eine ungültige Größe oder Prüfsumme.', 422);
                }
                $targetPath = $target . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $entry);
                $stream = $zip->getStream($entry);
                $output = fopen($targetPath, 'wb');
                if ($stream === false || $output === false) { throw new AppException('INVALID_ARCHIVE', 'Eine Archivdatei konnte nicht gelesen werden.', 422); }
                stream_copy_to_stream($stream, $output);
                fclose($stream); fclose($output);
                if ((filesize($targetPath) ?: 0) !== $expectedSize || !hash_equals($expectedHash, hash_file('sha256', $targetPath) ?: '')) {
                    throw new AppException('INVALID_ARCHIVE', 'Eine Archivdatei stimmt nicht mit ihrem Manifest überein.', 422);
                }
                $seen[$entry] = true;
            }
            if (count($seen) !== count($declared)) { throw new AppException('INVALID_ARCHIVE', 'Das Archiv ist unvollständig.', 422); }
            file_put_contents($target . DIRECTORY_SEPARATOR . 'manifest.json', $manifestRaw, LOCK_EX);
            $this->validateStaged($target);
            return [
                'formatVersion' => self::FORMAT_VERSION,
                'exportedAt' => (string) ($manifest['exportedAt'] ?? ''),
                'photoCount' => (int) ($manifest['photoCount'] ?? 0),
                'includesSecrets' => (bool) ($manifest['includesSecrets'] ?? false),
            ];
        } catch (\JsonException) {
            throw new AppException('INVALID_ARCHIVE', 'Das Archivmanifest enthält kein gültiges JSON.', 422);
        } finally {
            $zip->close();
        }
    }

    private function validateStaged(string $directory): void
    {
        $databasePath = $directory . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'app.sqlite';
        $this->backups->validateDatabase($databasePath);
        $photos = $this->activePhotos($databasePath);
        if (count($photos) > 8) { throw new AppException('INVALID_ARCHIVE', 'Das Archiv enthält zu viele aktive Familienfotos.', 422); }
        $expected = [];
        foreach ($photos as $photo) {
            $name = (string) $photo['stored_name'];
            $path = $directory . DIRECTORY_SEPARATOR . 'photos' . DIRECTORY_SEPARATOR . $name;
            if (!is_file($path) || !$this->validPhoto($path, (string) $photo['mime_type'])) {
                throw new AppException('INVALID_ARCHIVE', 'Ein in der Datenbank eingetragenes Familienfoto fehlt oder ist ungültig.', 422);
            }
            $expected[$name] = true;
        }
        $stored = glob($directory . DIRECTORY_SEPARATOR . 'photos' . DIRECTORY_SEPARATOR . '*') ?: [];
        foreach ($stored as $path) {
            if (!is_file($path) || !isset($expected[basename($path)])) { throw new AppException('INVALID_ARCHIVE', 'Das Archiv enthält ein unbekanntes Familienfoto.', 422); }
        }
        foreach (self::KEY_FILES as $keyName) {
            $path = $directory . DIRECTORY_SEPARATOR . 'keys' . DIRECTORY_SEPARATOR . $keyName;
            if (is_file($path) && ((filesize($path) ?: 0) < 16 || (filesize($path) ?: 0) > 4096)) {
                throw new AppException('INVALID_ARCHIVE', 'Ein Verbindungsschlüssel im Archiv ist ungültig.', 422);
            }
        }
    }

    /** @return list<array<string, mixed>> */
    private function activePhotos(string $databasePath): array
    {
        $database = new PDO('sqlite:' . $databasePath, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
        $exists = $database->query("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'wall_photos'")->fetchColumn();
        if ((int) $exists === 0) { return []; }
        return $database->query('SELECT stored_name, mime_type FROM wall_photos WHERE deleted_at IS NULL ORDER BY stored_name')->fetchAll();
    }

    /** @param array<string, mixed> $photo */
    private function photoPath(array $photo): string
    {
        $name = (string) ($photo['stored_name'] ?? '');
        $mime = (string) ($photo['mime_type'] ?? '');
        if (basename($name) !== $name || preg_match('/^[a-f0-9-]+\.(?:jpg|png|webp)$/i', $name) !== 1) {
            throw new AppException('ARCHIVE_FAILED', 'Ein gespeicherter Fotodateiname ist ungültig.');
        }
        $path = $this->config->wallPhotosPath() . DIRECTORY_SEPARATOR . $name;
        if (!is_file($path) || !$this->validPhoto($path, $mime)) { throw new AppException('ARCHIVE_FAILED', 'Ein Familienfoto fehlt oder ist ungültig.'); }
        return $path;
    }

    private function validPhoto(string $path, string $expectedMime): bool
    {
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($path);
        return is_string($mime) && isset(self::PHOTO_MIMES[$mime]) && $mime === $expectedMime && (filesize($path) ?: 0) <= 8_388_608;
    }

    /** @return array{size: int, sha256: string, type: string} */
    private function fileMetadata(string $path, string $type): array
    {
        $size = filesize($path); $hash = hash_file('sha256', $path);
        if ($size === false || $size < 1 || $hash === false) { throw new AppException('ARCHIVE_FAILED', 'Eine Archivdatei konnte nicht gelesen werden.'); }
        return ['size' => $size, 'sha256' => $hash, 'type' => $type];
    }

    private function allowedEntry(string $entry): bool
    {
        if ($entry === 'database/app.sqlite' || in_array($entry, array_map(static fn (string $name): string => 'keys/' . $name, self::KEY_FILES), true)) { return true; }
        return preg_match('#^photos/[a-f0-9-]+\.(?:jpg|png|webp)$#i', $entry) === 1;
    }

    private function keyPath(string $keyName): string
    {
        return $keyName === 'calendar-source.key' ? $this->config->calendarSourceKeyPath() : $this->config->secretKeyPath();
    }

    private function requireZip(): void
    {
        if (!class_exists(ZipArchive::class)) { throw new AppException('ZIP_UNAVAILABLE', 'Die PHP-Erweiterung zip ist für Familienarchive erforderlich.', 503); }
    }

    private function ensureDirectory(string $directory): void
    {
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) { throw new AppException('STORAGE_UNAVAILABLE', 'Der Archivspeicher konnte nicht angelegt werden.'); }
    }

    private function removeTree(string $directory): void
    {
        if (!is_dir($directory)) { return; }
        $items = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($directory, \FilesystemIterator::SKIP_DOTS), \RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($items as $item) { $item->isDir() ? @rmdir($item->getPathname()) : @unlink($item->getPathname()); }
        @rmdir($directory);
    }
}
