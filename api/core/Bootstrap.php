<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

use FamilyCompass\Config\Config;
use PDO;
use PDOException;

final class Bootstrap
{
    private ?PDO $database = null;

    public function __construct(private Config $config, private Logger $logger) {}

    public function run(): void
    {
        foreach ([$this->config->storagePath(), dirname($this->config->databasePath()), $this->config->backupsPath(), $this->config->logsPath()] as $directory) {
            if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
                throw new AppException('STORAGE_UNAVAILABLE', 'Der benötigte Speicherbereich konnte nicht erstellt werden.');
            }
        }
        if (!extension_loaded('pdo_sqlite')) {
            throw new AppException('PDO_SQLITE_UNAVAILABLE', 'Die PHP-Erweiterung pdo_sqlite ist nicht aktiviert.');
        }
        $backups = new BackupService($this->config, $this->logger);
        $backups->applyPendingRestore();
        (new PortableArchiveService($this->config, $this->logger, $backups))->applyPendingRestore();
        $database = $this->database();
        (new MigrationRunner($this->config, $backups, $this->logger))->run($database);
        $this->configureSession();
    }

    public function database(): PDO
    {
        if ($this->database instanceof PDO) {
            return $this->database;
        }
        try {
            $this->database = new PDO('sqlite:' . $this->config->databasePath(), null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $this->database->exec('PRAGMA foreign_keys = ON');
            $this->database->exec('PRAGMA busy_timeout = 5000');
            return $this->database;
        } catch (PDOException $exception) {
            throw new AppException('DATABASE_UNAVAILABLE', 'Die Datenbank ist derzeit nicht verfügbar.');
        }
    }

    private function configureSession(): void
    {
        if (PHP_SAPI === 'cli' || session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
        session_name('familyhub_session');
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.gc_maxlifetime', '1209600');
        session_set_cookie_params([
            'lifetime' => 1209600,
            'httponly' => true,
            'samesite' => $secure ? 'None' : 'Lax',
            'secure' => $secure,
            'path' => '/',
        ]);
        session_start();
    }
}
