<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class SchoolRepository
{
    public function __construct(private PDO $database) {}

    /** @return array{lessons: list<array<string, mixed>>, items: list<array<string, mixed>>} */
    public function board(string $from, string $to): array
    {
        $lessons = $this->database->query(
            'SELECT lesson.*, member.name AS member_name, member.color AS member_color
             FROM school_lessons lesson
             JOIN family_members member ON member.uuid = lesson.member_uuid
             WHERE lesson.deleted_at IS NULL AND member.deleted_at IS NULL AND member.is_active = 1
             ORDER BY lesson.weekday, lesson.starts_at, lesson.subject COLLATE NOCASE'
        )->fetchAll();
        $items = $this->database->prepare(
            'SELECT item.*, member.name AS member_name, member.color AS member_color
             FROM school_items item
             JOIN family_members member ON member.uuid = item.member_uuid
             WHERE item.deleted_at IS NULL AND member.deleted_at IS NULL AND member.is_active = 1
               AND ((item.due_date BETWEEN :from_date AND :to_date) OR (item.completed_at IS NULL AND item.due_date < :from_date))
             ORDER BY CASE WHEN item.completed_at IS NULL THEN 0 ELSE 1 END, item.due_date, item.item_type DESC, item.subject COLLATE NOCASE'
        );
        $items->execute(['from_date' => $from, 'to_date' => $to]);
        return [
            'lessons' => array_map([$this, 'mapLesson'], $lessons),
            'items' => array_map([$this, 'mapItem'], $items->fetchAll()),
        ];
    }

    /** @return array<string, mixed>|null */
    public function findLesson(string $uuid): ?array
    {
        return $this->find('school_lessons', $uuid, 'mapLesson');
    }

    /** @return array<string, mixed>|null */
    public function findItem(string $uuid): ?array
    {
        return $this->find('school_items', $uuid, 'mapItem');
    }

    /** @param array<string, mixed> $data */
    public function createLesson(array $data): void
    {
        $statement = $this->database->prepare('INSERT INTO school_lessons (uuid, member_uuid, subject, weekday, starts_at, ends_at, room, teacher, color, created_by_member_uuid, created_at, updated_at) VALUES (:uuid, :member_uuid, :subject, :weekday, :starts_at, :ends_at, :room, :teacher, :color, :created_by_member_uuid, :created_at, :updated_at)');
        $statement->execute($data);
    }

    /** @param array<string, mixed> $data */
    public function updateLesson(string $uuid, array $data): bool
    {
        $statement = $this->database->prepare('UPDATE school_lessons SET member_uuid = :member_uuid, subject = :subject, weekday = :weekday, starts_at = :starts_at, ends_at = :ends_at, room = :room, teacher = :teacher, color = :color, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute($data + ['uuid' => $uuid]);
        return $statement->rowCount() === 1;
    }

    /** @param array<string, mixed> $data */
    public function createItem(array $data): void
    {
        $statement = $this->database->prepare('INSERT INTO school_items (uuid, member_uuid, item_type, subject, title, description, due_date, created_by_member_uuid, created_at, updated_at) VALUES (:uuid, :member_uuid, :item_type, :subject, :title, :description, :due_date, :created_by_member_uuid, :created_at, :updated_at)');
        $statement->execute($data);
    }

    /** @param array<string, mixed> $data */
    public function updateItem(string $uuid, array $data): bool
    {
        $statement = $this->database->prepare('UPDATE school_items SET member_uuid = :member_uuid, item_type = :item_type, subject = :subject, title = :title, description = :description, due_date = :due_date, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute($data + ['uuid' => $uuid]);
        return $statement->rowCount() === 1;
    }

    public function toggleItem(string $uuid, bool $complete): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare('UPDATE school_items SET completed_at = :completed_at, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute(['uuid' => $uuid, 'completed_at' => $complete ? $now : null, 'updated_at' => $now]);
        return $statement->rowCount() === 1;
    }

    public function softDelete(string $table, string $uuid): bool
    {
        if (!in_array($table, ['school_lessons', 'school_items'], true)) { return false; }
        $now = gmdate('c');
        $statement = $this->database->prepare("UPDATE {$table} SET deleted_at = :now, updated_at = :now WHERE uuid = :uuid AND deleted_at IS NULL");
        $statement->execute(['uuid' => $uuid, 'now' => $now]);
        return $statement->rowCount() === 1;
    }

    /** @return array<string, mixed>|null */
    private function find(string $table, string $uuid, string $mapper): ?array
    {
        $statement = $this->database->prepare("SELECT entry.*, member.name AS member_name, member.color AS member_color FROM {$table} entry JOIN family_members member ON member.uuid = entry.member_uuid WHERE entry.uuid = :uuid AND entry.deleted_at IS NULL LIMIT 1");
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $this->{$mapper}($row);
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapLesson(array $row): array
    {
        return ['id' => $row['uuid'], 'member' => $this->member($row), 'subject' => $row['subject'], 'weekday' => (int) $row['weekday'], 'startsAt' => $row['starts_at'], 'endsAt' => $row['ends_at'], 'room' => $row['room'], 'teacher' => $row['teacher'], 'color' => $row['color'], 'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at']];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapItem(array $row): array
    {
        return ['id' => $row['uuid'], 'member' => $this->member($row), 'itemType' => $row['item_type'], 'subject' => $row['subject'], 'title' => $row['title'], 'description' => $row['description'], 'dueDate' => $row['due_date'], 'completedAt' => $row['completed_at'], 'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at']];
    }

    /** @param array<string, mixed> $row @return array{id: string, name: string, color: string} */
    private function member(array $row): array
    {
        return ['id' => $row['member_uuid'], 'name' => $row['member_name'], 'color' => $row['member_color']];
    }
}
