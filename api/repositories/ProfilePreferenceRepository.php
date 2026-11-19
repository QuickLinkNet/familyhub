<?php
declare(strict_types=1);

namespace FamilyHub\Repositories;

use PDO;

final class ProfilePreferenceRepository
{
    public function __construct(private PDO $database) {}

    /** @return array<string, mixed>|null */
    public function find(string $memberId): ?array
    {
        $statement = $this->database->prepare('SELECT * FROM profile_preferences WHERE member_uuid = :member_uuid LIMIT 1');
        $statement->execute(['member_uuid' => $memberId]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    /** @param array<string, mixed> $data */
    public function save(array $data): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO profile_preferences (member_uuid, dashboard_cards_json, wall_cards_json, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, created_at, updated_at)
             VALUES (:member_uuid, :dashboard_cards_json, :wall_cards_json, :quiet_hours_enabled, :quiet_hours_start, :quiet_hours_end, :created_at, :updated_at)
             ON CONFLICT(member_uuid) DO UPDATE SET dashboard_cards_json = excluded.dashboard_cards_json,
                wall_cards_json = excluded.wall_cards_json, quiet_hours_enabled = excluded.quiet_hours_enabled,
                quiet_hours_start = excluded.quiet_hours_start, quiet_hours_end = excluded.quiet_hours_end,
                updated_at = excluded.updated_at'
        );
        $statement->execute($data);
    }

    public function householdTimezone(): string
    {
        $value = $this->database->query('SELECT timezone FROM households ORDER BY id LIMIT 1')->fetchColumn();
        return is_string($value) && $value !== '' ? $value : 'Europe/Berlin';
    }
}
