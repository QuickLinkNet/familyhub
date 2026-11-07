<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class ShoppingRepository
{
    public function __construct(private PDO $database) {}

    /** @return list<array<string, mixed>> */
    public function all(): array
    {
        $lists = $this->database->query(
            'SELECT * FROM shopping_lists WHERE deleted_at IS NULL ORDER BY sort_order, created_at'
        )->fetchAll();
        $items = $this->database->query(
            'SELECT si.*, added.name AS added_by_name, checked.name AS checked_by_name
             FROM shopping_items si
             LEFT JOIN family_members added ON added.uuid = si.added_by_member_uuid
             LEFT JOIN family_members checked ON checked.uuid = si.checked_by_member_uuid
             WHERE si.deleted_at IS NULL
             ORDER BY si.is_checked, si.is_urgent DESC, si.category, si.created_at DESC'
        )->fetchAll();
        $byList = [];
        foreach ($items as $item) { $byList[$item['list_uuid']][] = $this->mapItem($item); }
        return array_map(fn (array $list): array => $this->mapList($list, $byList[$list['uuid']] ?? []), $lists);
    }

    /** @return array<string, mixed>|null */
    public function findList(string $uuid): ?array
    {
        $statement = $this->database->prepare('SELECT * FROM shopping_lists WHERE uuid = :uuid AND deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    /** @return array<string, mixed>|null */
    public function findItem(string $uuid): ?array
    {
        $statement = $this->database->prepare('SELECT * FROM shopping_items WHERE uuid = :uuid AND deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    /** @param array<string, mixed> $data */
    public function createList(array $data): void
    {
        $statement = $this->database->prepare('INSERT INTO shopping_lists (uuid, name, icon, color, sort_order, created_by_member_uuid, created_at, updated_at) VALUES (:uuid, :name, :icon, :color, :sort_order, :created_by_member_uuid, :created_at, :updated_at)');
        $statement->execute($data);
    }

    /** @param array<string, mixed> $data */
    public function createItem(array $data): void
    {
        $statement = $this->database->prepare('INSERT INTO shopping_items (uuid, list_uuid, name, quantity, category, note, is_urgent, is_checked, added_by_member_uuid, created_at, updated_at) VALUES (:uuid, :list_uuid, :name, :quantity, :category, :note, :is_urgent, 0, :added_by_member_uuid, :created_at, :updated_at)');
        $statement->execute($data);
    }

    /** @param list<array<string, mixed>> $items */
    public function createItems(array $items): void
    {
        $this->database->beginTransaction();
        try {
            foreach ($items as $item) { $this->createItem($item); }
            $this->database->commit();
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    /** @param array<string, mixed> $data */
    public function updateItem(string $uuid, array $data): bool
    {
        $statement = $this->database->prepare('UPDATE shopping_items SET name = :name, quantity = :quantity, category = :category, note = :note, is_urgent = :is_urgent, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute($data + ['uuid' => $uuid]);
        return $statement->rowCount() === 1;
    }

    public function toggleItem(string $uuid, string $actorUuid): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare(
            'UPDATE shopping_items
             SET is_checked = CASE is_checked WHEN 1 THEN 0 ELSE 1 END,
                 checked_by_member_uuid = CASE is_checked WHEN 1 THEN NULL ELSE :actor_uuid END,
                 checked_at = CASE is_checked WHEN 1 THEN NULL ELSE :checked_at END,
                 updated_at = :updated_at
             WHERE uuid = :uuid AND deleted_at IS NULL'
        );
        $statement->execute(['uuid' => $uuid, 'actor_uuid' => $actorUuid, 'checked_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount() === 1;
    }

    public function deleteItem(string $uuid): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare('UPDATE shopping_items SET deleted_at = :deleted_at, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount() === 1;
    }

    public function clearChecked(string $listUuid): int
    {
        $now = gmdate('c');
        $statement = $this->database->prepare('UPDATE shopping_items SET deleted_at = :deleted_at, updated_at = :updated_at WHERE list_uuid = :list_uuid AND is_checked = 1 AND deleted_at IS NULL');
        $statement->execute(['list_uuid' => $listUuid, 'deleted_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount();
    }

    public function deleteList(string $uuid): bool
    {
        $now = gmdate('c');
        $this->database->beginTransaction();
        try {
            $list = $this->database->prepare('UPDATE shopping_lists SET deleted_at = :deleted_at, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
            $list->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
            if ($list->rowCount() !== 1) { $this->database->rollBack(); return false; }
            $items = $this->database->prepare('UPDATE shopping_items SET deleted_at = :deleted_at, updated_at = :updated_at WHERE list_uuid = :uuid AND deleted_at IS NULL');
            $items->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
            $this->database->commit();
            return true;
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    /** @param array<string, mixed> $row @param list<array<string, mixed>> $items @return array<string, mixed> */
    private function mapList(array $row, array $items): array
    {
        return ['id' => $row['uuid'], 'name' => $row['name'], 'icon' => $row['icon'], 'color' => $row['color'], 'items' => $items, 'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at']];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapItem(array $row): array
    {
        return [
            'id' => $row['uuid'], 'listId' => $row['list_uuid'], 'name' => $row['name'], 'quantity' => $row['quantity'],
            'category' => $row['category'], 'note' => $row['note'], 'isUrgent' => (bool) $row['is_urgent'], 'isChecked' => (bool) $row['is_checked'],
            'addedBy' => ['id' => $row['added_by_member_uuid'], 'name' => $row['added_by_name']],
            'checkedBy' => $row['checked_by_member_uuid'] === null ? null : ['id' => $row['checked_by_member_uuid'], 'name' => $row['checked_by_name']],
            'checkedAt' => $row['checked_at'], 'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at'],
        ];
    }
}
