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
                throw new AppException('STORAGE_UNAVAILABLE', 'Der benÃ¶tigte Speicherbereich konnte nicht erstellt werden.');
            }
        }
        if (!extension_loaded('pdo_sqlite')) {
            throw new AppException('PDO_SQLITE_UNAVAILABLE', 'Die PHP-Erweiterung pdo_sqlite ist nicht aktiviert.');
        }
        $database = $this->database();
        (new MigrationRunner($this->config, new BackupService($this->config, $this->logger), $this->logger))->run($database);
        $this->configureSession();
    }

    public function database(): PDO
    {
        if ($this->database instanceof PDO) { return $this->database; }
        try {
            $this->database = new PDO('sqlite:' . $this->config->databasePath(), null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
            $this->database->exec('PRAGMA foreign_keys = ON');
            $this->database->exec('PRAGMA busy_timeout = 5000');
            return $this->database;
        } catch (PDOException $exception) {
            throw new AppException('DATABASE_UNAVAILABLE', 'Die Datenbank ist derzeit nicht verfÃ¼gbar.');
        }
    }

    private function configureSession(): void
    {
        if (PHP_SAPI === 'cli' || session_status() === PHP_SESSION_ACTIVE) { return; }
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'), 'path' => '/']);
        session_start();
    }
}
