<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\PortableArchiveService;
use PDO;

final class AdminArchiveService
{
    public function __construct(private PortableArchiveService $archives, private PDO $database) {}

    /** @return array<string, mixed> */
    public function create(): array { return $this->archives->create($this->database); }

    /** @param array<string, mixed> $file @return array<string, mixed> */
    public function restoreUpload(array $file, string $confirmation): array
    {
        if ($confirmation !== 'ARCHIV WIEDERHERSTELLEN') {
            throw new AppException('CONFIRMATION_REQUIRED', 'Bitte die Archiv-Wiederherstellung ausdrücklich bestätigen.', 422);
        }
        return $this->archives->scheduleUpload($file, $this->database);
    }
}
