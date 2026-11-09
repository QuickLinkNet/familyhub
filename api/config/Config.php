<?php
declare(strict_types=1);

namespace FamilyCompass\Config;

final class Config
{
    public function __construct(private string $rootPath) {}

    public function rootPath(): string { return $this->rootPath; }
    public function apiPath(): string { return $this->rootPath . DIRECTORY_SEPARATOR . 'api'; }
    public function storagePath(): string { return $this->rootPath . DIRECTORY_SEPARATOR . 'storage'; }
    public function databasePath(): string { return $this->storagePath() . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'app.sqlite'; }
    public function backupsPath(): string { return $this->storagePath() . DIRECTORY_SEPARATOR . 'backups'; }
    public function logsPath(): string { return $this->storagePath() . DIRECTORY_SEPARATOR . 'logs'; }
    public function calendarSourceKeyPath(): string { return $this->storagePath() . DIRECTORY_SEPARATOR . 'calendar-source.key'; }
    public function secretKeyPath(): string { return $this->storagePath() . DIRECTORY_SEPARATOR . 'application-secrets.key'; }
    public function migrationsPath(): string { return $this->apiPath() . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'migrations'; }
    public function version(): string { return '0.15.0'; }
    public function backupLimit(): int { return 14; }
}
