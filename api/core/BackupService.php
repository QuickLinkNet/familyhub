<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

use FamilyCompass\Config\Config;

final class BackupService
{
    public function __construct(private Config $config, private Logger $logger) {}

    public function create(string $reason): void
    {
        $database = $this->config->databasePath();
        if (!is_file($database) || filesize($database) === 0) {
            return;
        }
        $directory = $this->config->backupsPath();
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new AppException('STORAGE_UNAVAILABLE', 'Der Sicherungsordner konnte nicht erstellt werden.');
        }
        $target = sprintf('%s/app-%s-%s.sqlite', $directory, gmdate('Ymd-His'), preg_replace('/[^a-z0-9-]/i', '-', $reason));
        if (!copy($database, $target)) {
            throw new AppException('BACKUP_FAILED', 'Eine Datenbanksicherung konnte nicht erstellt werden.');
        }
        $backups = glob($directory . DIRECTORY_SEPARATOR . 'app-*.sqlite') ?: [];
        rsort($backups, SORT_STRING);
        foreach (array_slice($backups, $this->config->backupLimit()) as $oldBackup) {
            unlink($oldBackup);
        }
        $this->logger->info('Database backup created', ['reason' => $reason]);
    }
}
