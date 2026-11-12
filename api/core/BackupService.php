<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

use FamilyCompass\Config\Config;
use PDO;
use Throwable;

final class BackupService
{
    private const MAX_UPLOAD_SIZE = 209_715_200;
    private const FILE_PATTERN = '/^app-\d{8}-\d{6}-[a-z0-9-]+(?:-[a-f0-9]{6})?\.sqlite$/i';

    public function __construct(private Config $config, private Logger $logger) {}

    /** @return array<string, mixed>|null */
    public function create(string $reason, ?PDO $pdo = null): ?array
    {
        $database = $this->config->databasePath();
        if (!is_file($database) || filesize($database) === 0) { return null; }
        if ($pdo instanceof PDO && !$this->hasFamilySchema($pdo)) { return null; }
        $this->ensureBackupDirectory();
        $safeReason = trim((string) preg_replace('/[^a-z0-9-]+/i', '-', strtolower($reason)), '-');
        $filename = sprintf('app-%s-%s-%s.sqlite', gmdate('Ymd-His'), $safeReason ?: 'manual', bin2hex(random_bytes(3)));
        $target = $this->config->backupsPath() . DIRECTORY_SEPARATOR . $filename;
        if ($pdo instanceof PDO) {
            $quoted = $pdo->quote($target);
            if ($quoted === false) { throw new AppException('BACKUP_FAILED', 'Die Sicherungsdatei konnte nicht vorbereitet werden.'); }
            $pdo->exec('VACUUM INTO ' . $quoted);
        } elseif (!copy($database, $target)) {
            throw new AppException('BACKUP_FAILED', 'Eine Datenbanksicherung konnte nicht erstellt werden.');
        }
        $this->validateDatabase($target);
        $this->cleanup();
        $this->logger->info('Database backup created', ['reason' => $safeReason, 'file' => $filename]);
        return $this->metadata($target);
    }

    /** @return array{backups: list<array<string, mixed>>, pendingRestore: bool} */
    public function overview(): array
    {
        $files = glob($this->config->backupsPath() . DIRECTORY_SEPARATOR . 'app-*.sqlite') ?: [];
        $files = array_values(array_filter($files, fn (string $path): bool => preg_match(self::FILE_PATTERN, basename($path)) === 1));
        usort($files, static fn (string $left, string $right): int => (filemtime($right) ?: 0) <=> (filemtime($left) ?: 0));
        return [
            'backups' => array_map(fn (string $path): array => $this->metadata($path), $files),
            'pendingRestore' => is_file($this->pendingRestorePath()),
        ];
    }

    /** @return array{path: string, metadata: array<string, mixed>} */
    public function file(string $id): array
    {
        if (basename($id) !== $id || preg_match(self::FILE_PATTERN, $id) !== 1) {
            throw new AppException('NOT_FOUND', 'Die Sicherung wurde nicht gefunden.', 404);
        }
        $path = $this->config->backupsPath() . DIRECTORY_SEPARATOR . $id;
        if (!is_file($path)) { throw new AppException('NOT_FOUND', 'Die Sicherung wurde nicht gefunden.', 404); }
        return ['path' => $path, 'metadata' => $this->metadata($path)];
    }

    /** @return array{pendingRestore: bool, backup: array<string, mixed>} */
    public function scheduleExisting(string $id, PDO $pdo): array
    {
        $backup = $this->file($id);
        $this->validateDatabase($backup['path']);
        $this->stageRestore($backup['path'], $pdo);
        return ['pendingRestore' => true, 'backup' => $backup['metadata']];
    }

    /** @param array<string, mixed> $file @return array{pendingRestore: bool, name: string} */
    public function scheduleUpload(array $file, PDO $pdo): array
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        $size = (int) ($file['size'] ?? 0);
        $temporary = (string) ($file['tmp_name'] ?? '');
        $name = basename((string) ($file['name'] ?? ''));
        if ($error !== UPLOAD_ERR_OK || $size < 1 || $size > self::MAX_UPLOAD_SIZE || !is_uploaded_file($temporary)) {
            throw new AppException('VALIDATION_ERROR', 'Bitte eine SQLite-Sicherung mit höchstens 200 MB auswählen.', 422);
        }
        if (strtolower(pathinfo($name, PATHINFO_EXTENSION)) !== 'sqlite') {
            throw new AppException('VALIDATION_ERROR', 'Die Sicherungsdatei muss die Endung .sqlite haben.', 422);
        }
        $this->validateDatabase($temporary);
        $this->stageRestore($temporary, $pdo);
        return ['pendingRestore' => true, 'name' => mb_substr($name, 0, 180)];
    }

    public function applyPendingRestore(): void
    {
        $pending = $this->pendingRestorePath();
        if (!is_file($pending)) { return; }
        $this->validateDatabase($pending);
        $database = $this->config->databasePath();
        $rollback = $database . '.restore-rollback';
        if (is_file($rollback)) { @unlink($rollback); }
        try {
            if (is_file($database) && !rename($database, $rollback)) {
                throw new AppException('RESTORE_FAILED', 'Die bestehende Datenbank konnte nicht gesichert werden.');
            }
            if (!rename($pending, $database)) {
                if (is_file($rollback)) { @rename($rollback, $database); }
                throw new AppException('RESTORE_FAILED', 'Die Sicherung konnte nicht aktiviert werden.');
            }
            if (is_file($rollback)) { @unlink($rollback); }
            $this->logger->info('Pending database restore applied');
        } catch (Throwable $exception) {
            if (!is_file($database) && is_file($rollback)) { @rename($rollback, $database); }
            if ($exception instanceof AppException) { throw $exception; }
            throw new AppException('RESTORE_FAILED', 'Die Sicherung konnte nicht aktiviert werden.');
        }
    }

    private function stageRestore(string $source, PDO $pdo): void
    {
        $pending = $this->pendingRestorePath();
        $temporary = $pending . '.tmp-' . bin2hex(random_bytes(3));
        if (!copy($source, $temporary)) { throw new AppException('RESTORE_FAILED', 'Die Sicherung konnte nicht vorbereitet werden.'); }
        try {
            $this->validateDatabase($temporary);
            $this->create('before-restore', $pdo);
        } catch (Throwable $exception) {
            @unlink($temporary);
            throw $exception;
        }
        if (is_file($pending) && !unlink($pending)) { @unlink($temporary); throw new AppException('RESTORE_FAILED', 'Eine bestehende Wiederherstellung konnte nicht ersetzt werden.'); }
        if (!rename($temporary, $pending)) { @unlink($temporary); throw new AppException('RESTORE_FAILED', 'Die Sicherung konnte nicht bereitgestellt werden.'); }
        $this->logger->warning('Database restore scheduled', ['source' => basename($source)]);
    }

    public function validateDatabase(string $path): void
    {
        $handle = @fopen($path, 'rb');
        $header = $handle === false ? false : fread($handle, 16);
        if (is_resource($handle)) { fclose($handle); }
        if ($header !== "SQLite format 3\0") { throw new AppException('INVALID_BACKUP', 'Die Datei ist keine gültige SQLite-Sicherung.', 422); }
        try {
            $pdo = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            if ($pdo->query('PRAGMA integrity_check')->fetchColumn() !== 'ok') {
                throw new AppException('INVALID_BACKUP', 'Die SQLite-Sicherung ist beschädigt.', 422);
            }
            $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type = 'table'")->fetchAll(PDO::FETCH_COLUMN);
            foreach (['schema_migrations', 'family_members', 'households'] as $required) {
                if (!in_array($required, $tables, true)) { throw new AppException('INVALID_BACKUP', 'Die Datei ist keine vollständige FamilyHub-Sicherung.', 422); }
            }
        } catch (AppException $exception) {
            throw $exception;
        } catch (Throwable) {
            throw new AppException('INVALID_BACKUP', 'Die SQLite-Sicherung konnte nicht geprüft werden.', 422);
        }
    }

    private function hasFamilySchema(PDO $pdo): bool
    {
        $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type = 'table'")->fetchAll(PDO::FETCH_COLUMN);
        return in_array('family_members', $tables, true) && in_array('households', $tables, true);
    }

    /** @return array<string, mixed> */
    private function metadata(string $path): array
    {
        $id = basename($path);
        $reason = preg_replace('/^app-\d{8}-\d{6}-(.+?)(?:-[a-f0-9]{6})?\.sqlite$/i', '$1', $id) ?: 'manual';
        return [
            'id' => $id,
            'createdAt' => gmdate('c', filemtime($path) ?: time()),
            'size' => filesize($path) ?: 0,
            'reason' => $reason,
            'checksumSha256' => hash_file('sha256', $path) ?: '',
        ];
    }

    private function ensureBackupDirectory(): void
    {
        $directory = $this->config->backupsPath();
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new AppException('STORAGE_UNAVAILABLE', 'Der Sicherungsordner konnte nicht erstellt werden.');
        }
    }

    private function cleanup(): void
    {
        $files = glob($this->config->backupsPath() . DIRECTORY_SEPARATOR . 'app-*.sqlite') ?: [];
        rsort($files, SORT_STRING);
        foreach (array_slice($files, $this->config->backupLimit()) as $oldBackup) { @unlink($oldBackup); }
    }

    private function pendingRestorePath(): string
    {
        return dirname($this->config->databasePath()) . DIRECTORY_SEPARATOR . 'restore.pending.sqlite';
    }
}
