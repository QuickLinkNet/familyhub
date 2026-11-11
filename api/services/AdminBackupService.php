<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\BackupService;
use PDO;

final class AdminBackupService
{
    public function __construct(private BackupService $backups, private PDO $database) {}

    /** @return array{backups: list<array<string, mixed>>, pendingRestore: bool} */
    public function overview(): array { return $this->backups->overview(); }

    /** @return array<string, mixed> */
    public function create(): array
    {
        return $this->backups->create('manual', $this->database)
            ?? throw new AppException('BACKUP_FAILED', 'Die Datenbank ist noch nicht bereit für eine Sicherung.');
    }

    /** @return array{path: string, metadata: array<string, mixed>} */
    public function download(string $id): array { return $this->backups->file($id); }

    /** @return array<string, mixed> */
    public function restore(string $id, string $confirmation): array
    {
        $this->confirm($confirmation);
        return $this->backups->scheduleExisting($id, $this->database);
    }

    /** @param array<string, mixed> $file @return array<string, mixed> */
    public function restoreUpload(array $file, string $confirmation): array
    {
        $this->confirm($confirmation);
        return $this->backups->scheduleUpload($file, $this->database);
    }

    private function confirm(string $confirmation): void
    {
        if ($confirmation !== 'WIEDERHERSTELLEN') {
            throw new AppException('CONFIRMATION_REQUIRED', 'Bitte die Wiederherstellung ausdrücklich bestätigen.', 422);
        }
    }
}
