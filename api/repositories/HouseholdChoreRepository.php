<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class HouseholdChoreRepository
{
    public function __construct(private PDO $database) {}

    /** @return array{chores: list<array<string, mixed>>, completions: list<array<string, mixed>>} */
    public function board(): array
    {
        $chores = $this->database->query(
            'SELECT chore.*, member.name AS member_name, member.color AS member_color
             FROM household_chores chore
             JOIN family_members member ON member.uuid = chore.assigned_member_uuid
             WHERE chore.deleted_at IS NULL AND chore.is_active = 1 AND member.deleted_at IS NULL AND member.is_active = 1
             ORDER BY chore.next_due_date, chore.title COLLATE NOCASE'
        )->fetchAll();
        $completions = $this->database->query(
            'SELECT completion.*, chore.title, chore.category,
                    member.name AS member_name, member.color AS member_color
             FROM household_chore_completions completion
             JOIN household_chores chore ON chore.uuid = completion.chore_uuid
             JOIN family_members member ON member.uuid = completion.completed_by_member_uuid
             ORDER BY completion.completed_at DESC
             LIMIT 12'
        )->fetchAll();
        return [
            'chores' => array_map([$this, 'mapChore'], $chores),
            'completions' => array_map([$this, 'mapCompletion'], $completions),
        ];
    }

    /** @return array<string, mixed>|null */
    public function find(string $uuid): ?array
    {
        $statement = $this->database->prepare(
            'SELECT chore.*, member.name AS member_name, member.color AS member_color
             FROM household_chores chore
             JOIN family_members member ON member.uuid = chore.assigned_member_uuid
             WHERE chore.uuid = :uuid AND chore.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $this->mapChore($row);
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO household_chores (uuid, title, description, category, assigned_member_uuid, recurrence, next_due_date, created_by_member_uuid, created_at, updated_at)
             VALUES (:uuid, :title, :description, :category, :assigned_member_uuid, :recurrence, :next_due_date, :created_by_member_uuid, :created_at, :updated_at)'
        );
        $statement->execute($data);
    }

    /** @param array<string, mixed> $data */
    public function update(string $uuid, array $data): bool
    {
        $statement = $this->database->prepare(
            'UPDATE household_chores
             SET title = :title, description = :description, category = :category,
                 assigned_member_uuid = :assigned_member_uuid, recurrence = :recurrence,
                 next_due_date = :next_due_date, is_active = 1, updated_at = :updated_at
             WHERE uuid = :uuid AND deleted_at IS NULL'
        );
        $statement->execute($data + ['uuid' => $uuid]);
        return $statement->rowCount() === 1;
    }

    public function complete(string $uuid, string $scheduledDate, string $completedBy, string $completedAt, ?string $nextDueDate, string $completionUuid): bool
    {
        $this->database->beginTransaction();
        try {
            $completion = $this->database->prepare(
                'INSERT INTO household_chore_completions (uuid, chore_uuid, scheduled_date, completed_by_member_uuid, completed_at)
                 VALUES (:uuid, :chore_uuid, :scheduled_date, :completed_by_member_uuid, :completed_at)'
            );
            $completion->execute(['uuid' => $completionUuid, 'chore_uuid' => $uuid, 'scheduled_date' => $scheduledDate, 'completed_by_member_uuid' => $completedBy, 'completed_at' => $completedAt]);
            $chore = $this->database->prepare(
                'UPDATE household_chores
                 SET next_due_date = :next_due_date, last_completed_at = :completed_at,
                     is_active = :is_active, updated_at = :completed_at
                 WHERE uuid = :uuid AND deleted_at IS NULL AND is_active = 1'
            );
            $chore->execute(['uuid' => $uuid, 'next_due_date' => $nextDueDate, 'completed_at' => $completedAt, 'is_active' => $nextDueDate === null ? 0 : 1]);
            if ($chore->rowCount() !== 1) { $this->database->rollBack(); return false; }
            $this->database->commit();
            return true;
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    public function softDelete(string $uuid): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare('UPDATE household_chores SET deleted_at = :now, updated_at = :now WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute(['uuid' => $uuid, 'now' => $now]);
        return $statement->rowCount() === 1;
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapChore(array $row): array
    {
        return [
            'id' => $row['uuid'], 'title' => $row['title'], 'description' => $row['description'],
            'category' => $row['category'], 'recurrence' => $row['recurrence'],
            'nextDueDate' => $row['next_due_date'], 'lastCompletedAt' => $row['last_completed_at'],
            'isActive' => (bool) $row['is_active'],
            'assignedMember' => ['id' => $row['assigned_member_uuid'], 'name' => $row['member_name'], 'color' => $row['member_color']],
            'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at'],
        ];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapCompletion(array $row): array
    {
        return [
            'id' => $row['uuid'], 'choreId' => $row['chore_uuid'], 'title' => $row['title'], 'category' => $row['category'],
            'scheduledDate' => $row['scheduled_date'], 'completedAt' => $row['completed_at'],
            'completedBy' => ['id' => $row['completed_by_member_uuid'], 'name' => $row['member_name'], 'color' => $row['member_color']],
        ];
    }
}
