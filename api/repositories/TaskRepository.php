<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use FamilyCompass\Models\Task;
use PDO;

final class TaskRepository
{
    public function __construct(private PDO $database) {}

    /** @return list<Task> */
    public function all(): array
    {
        $statement = $this->database->query($this->selectSql() . ' WHERE t.deleted_at IS NULL ORDER BY CASE t.status WHEN \'OPEN\' THEN 0 WHEN \'PENDING_VERIFICATION\' THEN 1 ELSE 2 END, t.due_date IS NULL, t.due_date, t.created_at DESC');
        return array_map(static fn (array $row): Task => Task::fromRow($row), $statement->fetchAll());
    }

    public function find(string $uuid): ?Task
    {
        $statement = $this->database->prepare($this->selectSql() . ' WHERE t.uuid = :uuid AND t.deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : Task::fromRow($row);
    }

    public function create(array $data): Task
    {
        $this->insert($data);
        return $this->find($data['uuid']) ?? throw new \RuntimeException('Created task could not be retrieved.');
    }

    public function update(string $uuid, array $data): Task
    {
        $statement = $this->database->prepare('UPDATE tasks SET title = :title, description = :description, assigned_member_uuid = :assigned_member_uuid, due_date = :due_date, priority = :priority, requires_verification = :requires_verification, reward_points = :reward_points, routine_period = :routine_period, repeat_days = :repeat_days, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute($data + ['uuid' => $uuid]);
        return $this->find($uuid) ?? throw new \RuntimeException('Updated task could not be retrieved.');
    }

    /** @param array<string, mixed>|null $nextTask @param array<string, mixed>|null $rewardEntry */
    public function transition(string $uuid, string $fromStatus, string $toStatus, ?array $nextTask = null, ?array $rewardEntry = null): ?Task
    {
        $now = gmdate('c');
        $this->database->beginTransaction();
        try {
            $statement = $this->database->prepare('UPDATE tasks SET status = :to_status, completed_at = :completed_at, updated_at = :updated_at WHERE uuid = :uuid AND status = :from_status AND deleted_at IS NULL');
            $statement->execute(['uuid' => $uuid, 'from_status' => $fromStatus, 'to_status' => $toStatus, 'completed_at' => $now, 'updated_at' => $now]);
            if ($statement->rowCount() !== 1) {
                $this->database->rollBack();
                return null;
            }
            if ($nextTask !== null) {
                $this->insert($nextTask);
            }
            if ($rewardEntry !== null) {
                $reward = $this->database->prepare('INSERT INTO reward_ledger (uuid, member_uuid, task_uuid, reward_uuid, entry_type, points_delta, reason, created_by_member_uuid, created_at) VALUES (:uuid, :member_uuid, :task_uuid, NULL, \'EARNED\', :points_delta, :reason, :created_by_member_uuid, :created_at)');
                $reward->execute($rewardEntry);
            }
            $this->database->commit();
            return $this->find($uuid);
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    public function householdTimezone(): string
    {
        $timezone = $this->database->query('SELECT timezone FROM households ORDER BY id LIMIT 1')->fetchColumn();
        return is_string($timezone) && $timezone !== '' ? $timezone : 'Europe/Berlin';
    }

    public function softDelete(string $uuid): bool
    {
        $statement = $this->database->prepare('UPDATE tasks SET deleted_at = :deleted_at, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $now = gmdate('c');
        $statement->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount() === 1;
    }

    private function selectSql(): string
    {
        return 'SELECT t.*, fm.name AS assigned_member_name, fm.color AS assigned_member_color FROM tasks t LEFT JOIN family_members fm ON fm.uuid = t.assigned_member_uuid';
    }

    /** @param array<string, mixed> $data */
    private function insert(array $data): void
    {
        $statement = $this->database->prepare('INSERT INTO tasks (uuid, title, description, assigned_member_uuid, due_date, priority, status, requires_verification, reward_points, routine_period, repeat_days, series_uuid, created_at, updated_at) VALUES (:uuid, :title, :description, :assigned_member_uuid, :due_date, :priority, :status, :requires_verification, :reward_points, :routine_period, :repeat_days, :series_uuid, :created_at, :updated_at)');
        $statement->execute($data);
    }
}
