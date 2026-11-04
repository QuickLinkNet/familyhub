<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;
use Throwable;

final class SetupRepository
{
    public function __construct(private PDO $database) {}

    public function isComplete(): bool
    {
        return (int) $this->database->query('SELECT COUNT(*) FROM households WHERE setup_completed_at IS NOT NULL')->fetchColumn() > 0;
    }

    public function summary(): ?array
    {
        $household = $this->database->query('SELECT uuid, name, locale, timezone, setup_completed_at FROM households ORDER BY id LIMIT 1')->fetch();
        if ($household === false) { return null; }
        $members = $this->database->query('SELECT uuid AS id, name, role, color FROM family_members WHERE deleted_at IS NULL ORDER BY id')->fetchAll();
        $calendars = $this->database->query('SELECT uuid AS id, name, color, calendar_type AS type, owner_member_uuid AS ownerMemberId FROM calendars WHERE deleted_at IS NULL ORDER BY id')->fetchAll();
        return [
            'household' => ['id' => $household['uuid'], 'name' => $household['name'], 'locale' => $household['locale'], 'timezone' => $household['timezone']],
            'members' => $members,
            'calendars' => $calendars,
            'completedAt' => $household['setup_completed_at'],
        ];
    }

    public function install(array $household, array $members, array $calendars): array
    {
        $this->database->beginTransaction();
        try {
            $statement = $this->database->prepare('INSERT INTO households (uuid, name, locale, timezone, setup_completed_at, created_at, updated_at) VALUES (:uuid, :name, :locale, :timezone, :setup_completed_at, :created_at, :updated_at)');
            $statement->execute($household);
            $memberStatement = $this->database->prepare('INSERT INTO family_members (uuid, name, color, role, pin_hash, password_hash, avatar_url, is_active, created_at, updated_at) VALUES (:uuid, :name, :color, :role, :pin_hash, :password_hash, NULL, 1, :created_at, :updated_at)');
            foreach ($members as $member) { $memberStatement->execute($member); }
            $calendarStatement = $this->database->prepare('INSERT INTO calendars (uuid, household_uuid, owner_member_uuid, name, color, calendar_type, is_active, created_at, updated_at) VALUES (:uuid, :household_uuid, :owner_member_uuid, :name, :color, :calendar_type, 1, :created_at, :updated_at)');
            foreach ($calendars as $calendar) { $calendarStatement->execute($calendar); }
            $this->database->commit();
            return $this->summary() ?? [];
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }
}
