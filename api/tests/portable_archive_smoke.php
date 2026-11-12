<?php
declare(strict_types=1);

use FamilyCompass\Config\Config;
use FamilyCompass\Core\AppException;
use FamilyCompass\Core\BackupService;
use FamilyCompass\Core\Logger;
use FamilyCompass\Core\PortableArchiveService;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\';
    if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) { require $path; }
});

$root = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'familyhub-archive-smoke-' . bin2hex(random_bytes(4));
$config = new Config($root);
foreach ([dirname($config->databasePath()), $config->backupsPath(), $config->logsPath(), $config->wallPhotosPath()] as $directory) { mkdir($directory, 0775, true); }
$logger = new Logger($config);
$backups = new BackupService($config, $logger);
$archives = new PortableArchiveService($config, $logger, $backups);
$photoName = '11111111-2222-4333-8444-555555555555.png';
$photoPath = $config->wallPhotosPath() . DIRECTORY_SEPARATOR . $photoName;
$png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=', true);
if (!is_string($png)) { throw new RuntimeException('Test image could not be decoded.'); }

$createDatabase = static function (string $path, string $marker, string $photoName): PDO {
    $pdo = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $pdo->exec('CREATE TABLE schema_migrations (id INTEGER PRIMARY KEY, version TEXT NOT NULL)');
    $pdo->exec('CREATE TABLE family_members (id INTEGER PRIMARY KEY)');
    $pdo->exec('CREATE TABLE households (id INTEGER PRIMARY KEY)');
    $pdo->exec('CREATE TABLE smoke_marker (value TEXT NOT NULL)');
    $pdo->exec('CREATE TABLE wall_photos (stored_name TEXT NOT NULL, mime_type TEXT NOT NULL, deleted_at TEXT NULL)');
    $statement = $pdo->prepare('INSERT INTO smoke_marker (value) VALUES (:value)');
    $statement->execute(['value' => $marker]);
    $statement = $pdo->prepare('INSERT INTO wall_photos (stored_name, mime_type, deleted_at) VALUES (:name, :mime, NULL)');
    $statement->execute(['name' => $photoName, 'mime' => 'image/png']);
    return $pdo;
};

try {
    file_put_contents($photoPath, $png);
    $calendarKey = random_bytes(32); $secretKey = random_bytes(32);
    file_put_contents($config->calendarSourceKeyPath(), $calendarKey);
    file_put_contents($config->secretKeyPath(), $secretKey);
    $database = $createDatabase($config->databasePath(), 'archived', $photoName);
    $archive = $archives->create($database);
    if (!is_file($archive['path']) || $archive['photoCount'] !== 1 || $archive['includesSecrets'] !== true) {
        throw new RuntimeException('Creating the portable archive failed.');
    }
    $zip = new ZipArchive(); $zip->open($archive['path']);
    $manifest = json_decode((string) $zip->getFromName('manifest.json'), true, 32, JSON_THROW_ON_ERROR);
    if (($manifest['formatVersion'] ?? null) !== 1 || $zip->locateName('database/app.sqlite') === false || $zip->locateName('photos/' . $photoName) === false) {
        throw new RuntimeException('Portable archive entries are incomplete.');
    }
    $zip->close();

    $tampered = $root . DIRECTORY_SEPARATOR . 'tampered.familyhub';
    copy($archive['path'], $tampered);
    $zip = new ZipArchive(); $zip->open($tampered); $zip->addFromString('photos/' . $photoName, 'not an image'); $zip->close();
    try {
        $archives->scheduleFile($tampered, $database);
        throw new RuntimeException('A tampered archive was accepted.');
    } catch (AppException $exception) {
        if ($exception->errorCode() !== 'INVALID_ARCHIVE') { throw $exception; }
    }
    unset($exception);

    $database->exec("UPDATE smoke_marker SET value = 'current'");
    file_put_contents($photoPath, $png . 'changed');
    file_put_contents($config->calendarSourceKeyPath(), random_bytes(32));
    file_put_contents($config->secretKeyPath(), random_bytes(32));
    $scheduled = $archives->scheduleFile($archive['path'], $database, 'family.familyhub');
    if (($scheduled['pendingRestore'] ?? false) !== true || !is_dir($config->archiveRestorePath())) {
        throw new RuntimeException('Scheduling the portable archive restore failed.');
    }
    $database = null;
    gc_collect_cycles();
    usleep(100000);
    $archives->applyPendingRestore();
    $restored = new PDO('sqlite:' . $config->databasePath());
    if ($restored->query('SELECT value FROM smoke_marker')->fetchColumn() !== 'archived') { throw new RuntimeException('The archived database was not restored.'); }
    if (hash_file('sha256', $photoPath) !== hash('sha256', $png)) { throw new RuntimeException('The archived photo was not restored.'); }
    if (file_get_contents($config->calendarSourceKeyPath()) !== $calendarKey || file_get_contents($config->secretKeyPath()) !== $secretKey) {
        throw new RuntimeException('The archived encryption keys were not restored.');
    }
    echo "Portable archive smoke test passed.\n";
} finally {
    unset($database, $restored, $archives, $backups);
    gc_collect_cycles(); usleep(100000);
    if (is_dir($root)) {
        $items = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($items as $item) { $item->isDir() ? @rmdir($item->getPathname()) : @unlink($item->getPathname()); }
        @rmdir($root);
    }
}
