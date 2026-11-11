<?php
declare(strict_types=1);

use FamilyCompass\Config\Config;
use FamilyCompass\Core\AppException;
use FamilyCompass\Core\BackupService;
use FamilyCompass\Core\Logger;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\';
    if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) { require $path; }
});

$root = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'familyhub-backup-smoke-' . bin2hex(random_bytes(4));
$databaseDirectory = $root . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'database';
$backupDirectory = $root . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'backups';
mkdir($databaseDirectory, 0775, true);
mkdir($backupDirectory, 0775, true);
$config = new Config($root);
$service = new BackupService($config, new Logger($config));

$createDatabase = static function (string $path, string $marker): PDO {
    $pdo = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $pdo->exec('CREATE TABLE schema_migrations (id INTEGER PRIMARY KEY, version TEXT NOT NULL)');
    $pdo->exec('CREATE TABLE family_members (id INTEGER PRIMARY KEY)');
    $pdo->exec('CREATE TABLE households (id INTEGER PRIMARY KEY)');
    $pdo->exec('CREATE TABLE smoke_marker (value TEXT NOT NULL)');
    $statement = $pdo->prepare('INSERT INTO smoke_marker (value) VALUES (:value)');
    $statement->execute(['value' => $marker]);
    return $pdo;
};

try {
    $freshDatabase = new PDO('sqlite:' . $config->databasePath());
    $freshDatabase->exec('CREATE TABLE schema_migrations (id INTEGER PRIMARY KEY, version TEXT NOT NULL)');
    if ($service->create('before-migration', $freshDatabase) !== null) {
        throw new RuntimeException('Fresh database should not create an incomplete backup.');
    }
    $freshDatabase = null;
    @unlink($config->databasePath());
    $database = $createDatabase($config->databasePath(), 'current');
    $manual = $service->create('manual', $database);
    $overview = $service->overview();
    if ($manual === null || count($overview['backups']) !== 1 || strlen((string) $manual['checksumSha256']) !== 64) {
        throw new RuntimeException('Creating or listing a backup failed.');
    }

    $restorePath = $root . DIRECTORY_SEPARATOR . 'restore-source.sqlite';
    $restoreDatabase = $createDatabase($restorePath, 'restored');
    $restoreDatabase = null;
    $restoreId = 'app-20000101-120000-import-a1b2c3.sqlite';
    copy($restorePath, $backupDirectory . DIRECTORY_SEPARATOR . $restoreId);
    for ($day = 2; $day <= 14; $day++) {
        copy($restorePath, $backupDirectory . DIRECTORY_SEPARATOR . sprintf('app-200001%02d-120000-filler-a1b2c3.sqlite', $day));
    }
    $scheduled = $service->scheduleExisting($restoreId, $database);
    if ($scheduled['pendingRestore'] !== true || !is_file($databaseDirectory . DIRECTORY_SEPARATOR . 'restore.pending.sqlite')) {
        throw new RuntimeException('Scheduling a restore failed.');
    }
    $database = null;
    $service->applyPendingRestore();
    $restored = new PDO('sqlite:' . $config->databasePath());
    if ($restored->query('SELECT value FROM smoke_marker')->fetchColumn() !== 'restored') {
        throw new RuntimeException('Applying a restore failed.');
    }
    $restored = null;

    $invalidId = 'app-20261111-130000-invalid-d4e5f6.sqlite';
    file_put_contents($backupDirectory . DIRECTORY_SEPARATOR . $invalidId, 'not a sqlite database');
    $reopened = new PDO('sqlite:' . $config->databasePath());
    try {
        $service->scheduleExisting($invalidId, $reopened);
        throw new RuntimeException('Invalid backup was accepted.');
    } catch (AppException $exception) {
        if ($exception->errorCode() !== 'INVALID_BACKUP') { throw $exception; }
    }
    $reopened = null;
    echo "Backup service smoke test passed.\n";
} finally {
    unset($freshDatabase, $reopened, $restored, $database, $restoreDatabase, $service);
    gc_collect_cycles();
    usleep(100000);
    if (is_dir($root)) {
        $items = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($items as $item) { $item->isDir() ? @rmdir($item->getPathname()) : @unlink($item->getPathname()); }
        @rmdir($root);
    }
}
