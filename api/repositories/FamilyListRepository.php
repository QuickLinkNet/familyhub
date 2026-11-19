<?php
declare(strict_types=1);

namespace FamilyHub\Repositories;

use PDO;

final class FamilyListRepository
{
    public function __construct(private PDO $database) {}

    /** @param array{id: string, role: string} $actor @return list<array<string, mixed>> */
    public function visible(array $actor): array
    {
        $statement = $this->database->prepare(
            'SELECT fl.*, creator.name AS creator_name, creator.color AS creator_color
             FROM family_lists fl
             JOIN family_members creator ON creator.uuid = fl.created_by_member_uuid
             WHERE fl.deleted_at IS NULL
               AND (fl.created_by_member_uuid = :actor_uuid
                    OR fl.visibility = \'FAMILY\'
                    OR (fl.visibility = \'ADULTS\' AND :is_adult = 1))
             ORDER BY fl.updated_at DESC, fl.name COLLATE NOCASE'
        );
        $statement->execute([
            'actor_uuid' => $actor['id'],
            'is_adult' => in_array($actor['role'], ['ADMIN', 'PARENT'], true) ? 1 : 0,
        ]);
        $lists = $statement->fetchAll();
        $items = $this->database->query(
            'SELECT item.*, creator.name AS creator_name,
                    assignee.name AS assignee_name, assignee.color AS assignee_color,
                    completed.name AS completed_by_name
             FROM family_list_items item
             JOIN family_members creator ON creator.uuid = item.created_by_member_uuid
             LEFT JOIN family_members assignee ON assignee.uuid = item.assigned_to_member_uuid
             LEFT JOIN family_members completed ON completed.uuid = item.completed_by_member_uuid
             WHERE item.deleted_at IS NULL
             ORDER BY item.is_completed, item.created_at'
        )->fetchAll();
        $byList = [];
        foreach ($items as $item) { $byList[$item['list_uuid']][] = $this->mapItem($item); }
        return array_map(function (array $list) use ($byList, $actor): array {
            $mapped = $this->mapList($list, $byList[$list['uuid']] ?? []);
            $mapped['canManage'] = $list['created_by_member_uuid'] === $actor['id']
                || ($list['visibility'] !== 'PRIVATE' && in_array($actor['role'], ['ADMIN', 'PARENT'], true));
            return $mapped;
        }, $lists);
    }

    /** @return array<string, mixed>|null */
    public function findList(string $uuid): ?array
    {
        $statement = $this->database->prepare('SELECT * FROM family_lists WHERE uuid = :uuid AND deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    /** @return array<string, mixed>|null */
    public function findItem(string $uuid): ?array
    {
        $statement = $this->database->prepare(
            'SELECT item.*, list.visibility, list.created_by_member_uuid AS list_owner_uuid
             FROM family_list_items item
             JOIN family_lists list ON list.uuid = item.list_uuid
             WHERE item.uuid = :uuid AND item.deleted_at IS NULL AND list.deleted_at IS NULL LIMIT 1'
        );
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    /** @param array<string, mixed> $data */
    public function createList(array $data): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO family_lists
                (uuid, name, description, icon, color, visibility, created_by_member_uuid, created_at, updated_at)
             VALUES
                (:uuid, :name, :description, :icon, :color, :visibility, :created_by_member_uuid, :created_at, :updated_at)'
        );
        $statement->execute($data);
    }

    /** @param array<string, mixed> $data */
    public function updateList(string $uuid, array $data): bool
    {
        $statement = $this->database->prepare(
            'UPDATE family_lists SET name = :name, description = :description, icon = :icon,
                    color = :color, visibility = :visibility, updated_at = :updated_at
             WHERE uuid = :uuid AND deleted_at IS NULL'
        );
        $statement->execute($data + ['uuid' => $uuid]);
        return $statement->rowCount() === 1;
    }

    /** @param array<string, mixed> $data */
    public function createItem(array $data): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO family_list_items
                (uuid, list_uuid, title, note, assigned_to_member_uuid, created_by_member_uuid, created_at, updated_at)
             VALUES
                (:uuid, :list_uuid, :title, :note, :assigned_to_member_uuid, :created_by_member_uuid, :created_at, :updated_at)'
        );
        $statement->execute($data);
    }

    /** @param array<string, mixed> $data */
    public function updateItem(string $uuid, array $data): bool
    {
        $statement = $this->database->prepare(
            'UPDATE family_list_items SET title = :title, note = :note,
                    assigned_to_member_uuid = :assigned_to_member_uuid, updated_at = :updated_at
             WHERE uuid = :uuid AND deleted_at IS NULL'
        );
        $statement->execute($data + ['uuid' => $uuid]);
        return $statement->rowCount() === 1;
    }

    public function toggleItem(string $uuid, string $actorUuid): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare(
            'UPDATE family_list_items
             SET is_completed = CASE is_completed WHEN 1 THEN 0 ELSE 1 END,
                 completed_by_member_uuid = CASE is_completed WHEN 1 THEN NULL ELSE :actor_uuid END,
                 completed_at = CASE is_completed WHEN 1 THEN NULL ELSE :completed_at END,
                 updated_at = :updated_at
             WHERE uuid = :uuid AND deleted_at IS NULL'
        );
        $statement->execute(['uuid' => $uuid, 'actor_uuid' => $actorUuid, 'completed_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount() === 1;
    }

    public function deleteItem(string $uuid): bool
    {
        return $this->softDelete('family_list_items', $uuid);
    }

    public function clearCompleted(string $listUuid): int
    {
        $now = gmdate('c');
        $statement = $this->database->prepare(
            'UPDATE family_list_items SET deleted_at = :deleted_at, updated_at = :updated_at
             WHERE list_uuid = :list_uuid AND is_completed = 1 AND deleted_at IS NULL'
        );
        $statement->execute(['list_uuid' => $listUuid, 'deleted_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount();
    }

    public function deleteList(string $uuid): bool
    {
        $now = gmdate('c');
        $this->database->beginTransaction();
        try {
            $list = $this->database->prepare(
                'UPDATE family_lists SET deleted_at = :deleted_at, updated_at = :updated_at
                 WHERE uuid = :uuid AND deleted_at IS NULL'
            );
            $list->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
            if ($list->rowCount() !== 1) { $this->database->rollBack(); return false; }
            $items = $this->database->prepare(
                'UPDATE family_list_items SET deleted_at = :deleted_at, updated_at = :updated_at
                 WHERE list_uuid = :uuid AND deleted_at IS NULL'
            );
            $items->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
            $this->database->commit();
            return true;
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    private function softDelete(string $table, string $uuid): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare("UPDATE {$table} SET deleted_at = :deleted_at, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL");
        $statement->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount() === 1;
    }

    /** @param array<string, mixed> $row @param list<array<string, mixed>> $items @return array<string, mixed> */
    private function mapList(array $row, array $items): array
    {
        return [
            'id' => $row['uuid'], 'name' => $row['name'], 'description' => $row['description'],
            'icon' => $row['icon'], 'color' => $row['color'], 'visibility' => $row['visibility'],
            'createdBy' => ['id' => $row['created_by_member_uuid'], 'name' => $row['creator_name'], 'color' => $row['creator_color']],
            'items' => $items, 'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at'],
        ];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapItem(array $row): array
    {
        return [
            'id' => $row['uuid'], 'listId' => $row['list_uuid'], 'title' => $row['title'], 'note' => $row['note'],
            'isCompleted' => (bool) $row['is_completed'],
            'assignedTo' => $row['assigned_to_member_uuid'] === null ? null : ['id' => $row['assigned_to_member_uuid'], 'name' => $row['assignee_name'], 'color' => $row['assignee_color']],
            'createdBy' => ['id' => $row['created_by_member_uuid'], 'name' => $row['creator_name']],
            'completedBy' => $row['completed_by_member_uuid'] === null ? null : ['id' => $row['completed_by_member_uuid'], 'name' => $row['completed_by_name']],
            'completedAt' => $row['completed_at'], 'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at'],
        ];
    }
}
