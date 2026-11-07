<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class FamilyNoteRepository
{
    public function __construct(private PDO $database) {}

    /** @return list<array<string, mixed>> */
    public function visible(string $today): array
    {
        $statement = $this->database->prepare(
            'SELECT n.*, fm.name AS creator_name, fm.color AS creator_color
             FROM family_notes n
             JOIN family_members fm ON fm.uuid = n.created_by_member_uuid
             WHERE n.deleted_at IS NULL AND (n.expires_on IS NULL OR n.expires_on >= :today)
             ORDER BY n.is_important DESC,
                      CASE WHEN n.expires_on IS NULL THEN 1 ELSE 0 END,
                      n.expires_on,
                      n.updated_at DESC'
        );
        $statement->execute(['today' => $today]);
        return array_map([$this, 'map'], $statement->fetchAll());
    }

    /** @return array<string, mixed>|null */
    public function find(string $uuid): ?array
    {
        $statement = $this->database->prepare(
            'SELECT n.*, fm.name AS creator_name, fm.color AS creator_color
             FROM family_notes n
             JOIN family_members fm ON fm.uuid = n.created_by_member_uuid
             WHERE n.uuid = :uuid AND n.deleted_at IS NULL LIMIT 1'
        );
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $this->map($row);
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO family_notes
                (uuid, title, body, icon, color, is_important, expires_on, created_by_member_uuid, created_at, updated_at)
             VALUES
                (:uuid, :title, :body, :icon, :color, :is_important, :expires_on, :created_by_member_uuid, :created_at, :updated_at)'
        );
        $statement->execute($data);
    }

    /** @param array<string, mixed> $data */
    public function update(string $uuid, array $data): bool
    {
        $statement = $this->database->prepare(
            'UPDATE family_notes SET title = :title, body = :body, icon = :icon, color = :color,
                    is_important = :is_important, expires_on = :expires_on, updated_at = :updated_at
             WHERE uuid = :uuid AND deleted_at IS NULL'
        );
        $statement->execute($data + ['uuid' => $uuid]);
        return $statement->rowCount() === 1;
    }

    public function softDelete(string $uuid): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare(
            'UPDATE family_notes SET deleted_at = :deleted_at, updated_at = :updated_at
             WHERE uuid = :uuid AND deleted_at IS NULL'
        );
        $statement->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount() === 1;
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function map(array $row): array
    {
        return [
            'id' => $row['uuid'],
            'title' => $row['title'],
            'body' => $row['body'],
            'icon' => $row['icon'],
            'color' => $row['color'],
            'isImportant' => (bool) $row['is_important'],
            'expiresOn' => $row['expires_on'],
            'createdBy' => [
                'id' => $row['created_by_member_uuid'],
                'name' => $row['creator_name'],
                'color' => $row['creator_color'],
            ],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ];
    }
}
