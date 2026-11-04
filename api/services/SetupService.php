<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\SetupRepository;

final class SetupService
{
    private const ROLES = ['ADMIN', 'PARENT', 'CHILD'];

    public function __construct(private SetupRepository $repository) {}

    public function status(string $version): array
    {
        $complete = $this->repository->isComplete();
        return [
            'required' => !$complete,
            'completed' => $complete,
            'version' => $version,
            'installation' => null,
        ];
    }

    public function install(array $input): array
    {
        if ($this->repository->isComplete()) { throw new AppException('SETUP_ALREADY_COMPLETED', 'Die Ersteinrichtung wurde bereits abgeschlossen.', 409); }
        $name = trim((string) ($input['householdName'] ?? ''));
        if (mb_strlen($name) < 2 || mb_strlen($name) > 80) { throw new AppException('VALIDATION_ERROR', 'Der Haushaltsname muss zwischen 2 und 80 Zeichen lang sein.', 422); }
        $locale = trim((string) ($input['locale'] ?? 'de-DE'));
        if (preg_match('/^[a-z]{2}-[A-Z]{2}$/', $locale) !== 1) { throw new AppException('VALIDATION_ERROR', 'Die Spracheinstellung ist ungültig.', 422); }
        $timezone = trim((string) ($input['timezone'] ?? 'Europe/Berlin'));
        if (!in_array($timezone, timezone_identifiers_list(), true)) { throw new AppException('VALIDATION_ERROR', 'Die Zeitzone ist ungültig.', 422); }
        $rawMembers = $input['members'] ?? null;
        if (!is_array($rawMembers) || count($rawMembers) < 1 || count($rawMembers) > 12) { throw new AppException('VALIDATION_ERROR', 'Es müssen zwischen 1 und 12 Familienmitglieder angelegt werden.', 422); }

        $now = gmdate('c');
        $householdUuid = $this->uuid();
        $members = [];
        $calendars = [[
            'uuid' => $this->uuid(), 'household_uuid' => $householdUuid, 'owner_member_uuid' => null,
            'name' => 'Familie', 'color' => '#345B48', 'calendar_type' => 'SHARED', 'created_at' => $now, 'updated_at' => $now,
        ]];
        $hasAdult = false;
        foreach ($rawMembers as $rawMember) {
            if (!is_array($rawMember)) { throw new AppException('VALIDATION_ERROR', 'Ein Familienmitglied ist ungültig.', 422); }
            $memberName = trim((string) ($rawMember['name'] ?? ''));
            if (mb_strlen($memberName) < 2 || mb_strlen($memberName) > 80) { throw new AppException('VALIDATION_ERROR', 'Jeder Name muss zwischen 2 und 80 Zeichen lang sein.', 422); }
            $role = strtoupper((string) ($rawMember['role'] ?? 'CHILD'));
            if (!in_array($role, self::ROLES, true)) { throw new AppException('VALIDATION_ERROR', 'Eine Rolle ist ungültig.', 422); }
            $color = strtoupper((string) ($rawMember['color'] ?? '#345B48'));
            if (preg_match('/^#[0-9A-F]{6}$/', $color) !== 1) { throw new AppException('VALIDATION_ERROR', 'Eine Personenfarbe ist ungültig.', 422); }
            $passwordHash = null;
            $pinHash = null;
            if ($role === 'ADMIN' || $role === 'PARENT') {
                $hasAdult = true;
                $password = (string) ($rawMember['password'] ?? '');
                if (strlen($password) < 8 || strlen($password) > 128) { throw new AppException('VALIDATION_ERROR', 'Passwörter für Erwachsene müssen mindestens 8 Zeichen lang sein.', 422); }
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            } else {
                $pin = (string) ($rawMember['pin'] ?? '');
                if ($pin !== '' && preg_match('/^\d{4,8}$/', $pin) !== 1) { throw new AppException('VALIDATION_ERROR', 'Kinder-PINs müssen aus 4 bis 8 Ziffern bestehen.', 422); }
                $pinHash = $pin === '' ? null : password_hash($pin, PASSWORD_DEFAULT);
            }
            $memberUuid = $this->uuid();
            $members[] = ['uuid' => $memberUuid, 'name' => $memberName, 'color' => $color, 'role' => $role, 'pin_hash' => $pinHash, 'password_hash' => $passwordHash, 'created_at' => $now, 'updated_at' => $now];
            $calendars[] = ['uuid' => $this->uuid(), 'household_uuid' => $householdUuid, 'owner_member_uuid' => $memberUuid, 'name' => $memberName, 'color' => $color, 'calendar_type' => 'PERSONAL', 'created_at' => $now, 'updated_at' => $now];
        }
        if (!$hasAdult) { throw new AppException('VALIDATION_ERROR', 'Mindestens ein Admin oder Elternteil ist erforderlich.', 422); }
        $household = ['uuid' => $householdUuid, 'name' => $name, 'locale' => $locale, 'timezone' => $timezone, 'setup_completed_at' => $now, 'created_at' => $now, 'updated_at' => $now];
        return $this->repository->install($household, $members, $calendars);
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
