<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use FamilyCompass\Models\FamilyMember;
use PDO;

final class FamilyMemberRepository
{
    public function __construct(private PDO $database) {}

    /** @return list<FamilyMember> */
    public function all(): array
    {
        $statement = $this->database->query('SELECT * FROM family_members WHERE deleted_at IS NULL ORDER BY is_active DESC, name COLLATE NOCASE');
        return array_map(static fn (array $row): FamilyMember => FamilyMember::fromRow($row), $statement->fetchAll());
    }

    public function find(string $uuid): ?FamilyMember
    {
        $statement = $this->database->prepare('SELECT * FROM family_members WHERE uuid = :uuid AND deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : FamilyMember::fromRow($row);
    }

    public function create(array $data, string $calendarUuid): FamilyMember
    {
        $this->database->beginTransaction();
        try {
            $statement = $this->database->prepare('INSERT INTO family_members (uuid, name, color, role, pin_hash, password_hash, avatar_url, birth_date, is_active, created_at, updated_at) VALUES (:uuid, :name, :color, :role, :pin_hash, :password_hash, :avatar_url, :birth_date, :is_active, :created_at, :updated_at)');
            $statement->execute($data);
            $householdUuid = $this->database->query('SELECT uuid FROM households ORDER BY id LIMIT 1')->fetchColumn();
            if (!is_string($householdUuid) || $householdUuid === '') {
                throw new \RuntimeException('Household could not be retrieved.');
            }
            $calendar = $this->database->prepare('INSERT INTO calendars (uuid, household_uuid, owner_member_uuid, name, color, calendar_type, is_active, created_at, updated_at) VALUES (:uuid, :household_uuid, :owner_member_uuid, :name, :color, \'PERSONAL\', 1, :created_at, :updated_at)');
            $calendar->execute([
                'uuid' => $calendarUuid,
                'household_uuid' => $householdUuid,
                'owner_member_uuid' => $data['uuid'],
                'name' => $data['name'],
                'color' => $data['color'],
                'created_at' => $data['created_at'],
                'updated_at' => $data['updated_at'],
            ]);
            $this->database->commit();
            return $this->find($data['uuid']) ?? throw new \RuntimeException('Created family member could not be retrieved.');
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    public function update(string $uuid, array $data): FamilyMember
    {
        $statement = $this->database->prepare(
            'UPDATE family_members
             SET name = :name,
                 color = :color,
                 role = :role,
                 pin_hash = CASE WHEN :clear_pin_hash = 1 THEN NULL ELSE COALESCE(:pin_hash, pin_hash) END,
                 password_hash = CASE WHEN :clear_password_hash = 1 THEN NULL ELSE COALESCE(:password_hash, password_hash) END,
                 avatar_url = :avatar_url,
                 birth_date = :birth_date,
                 is_active = :is_active,
                 updated_at = :updated_at
             WHERE uuid = :uuid AND deleted_at IS NULL'
        );
        $statement->execute($data + ['uuid' => $uuid]);
        return $this->find($uuid) ?? throw new \RuntimeException('Updated family member could not be retrieved.');
    }

    public function softDelete(string $uuid): bool
    {
        $statement = $this->database->prepare('UPDATE family_members SET deleted_at = :deleted_at, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $now = gmdate('c');
        $statement->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount() === 1;
    }
}
