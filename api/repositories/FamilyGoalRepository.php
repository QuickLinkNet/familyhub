<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class FamilyGoalRepository
{
    public function __construct(private PDO $database) {}

    /** @return array<string, mixed> */
    public function board(): array
    {
        $active = $this->database->query($this->goalSelect() . ' WHERE goal.deleted_at IS NULL AND goal.completed_at IS NULL GROUP BY goal.id ORDER BY COALESCE(goal.due_date, "9999-12-31"), goal.created_at')->fetchAll();
        $completed = $this->database->query($this->goalSelect() . ' WHERE goal.deleted_at IS NULL AND goal.completed_at IS NOT NULL GROUP BY goal.id ORDER BY goal.completed_at DESC LIMIT 8')->fetchAll();
        $activity = $this->database->query(
            'SELECT contribution.*, goal.title AS goal_title, goal.icon AS goal_icon,
                    member.name AS member_name, member.color AS member_color
             FROM family_goal_contributions contribution
             JOIN family_goals goal ON goal.uuid = contribution.goal_uuid
             JOIN family_members member ON member.uuid = contribution.member_uuid
             WHERE goal.deleted_at IS NULL
             ORDER BY contribution.created_at DESC, contribution.id DESC LIMIT 30'
        )->fetchAll();
        return [
            'activeGoals' => array_map([$this, 'mapGoal'], $active),
            'completedGoals' => array_map([$this, 'mapGoal'], $completed),
            'activity' => array_map([$this, 'mapActivity'], $activity),
        ];
    }

    /** @return array<string, mixed>|null */
    public function find(string $uuid): ?array
    {
        $statement = $this->database->prepare($this->goalSelect() . ' WHERE goal.uuid = :uuid AND goal.deleted_at IS NULL GROUP BY goal.id LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $this->mapGoal($row);
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO family_goals (uuid, title, description, icon, color, target_value, due_date, created_by_member_uuid, created_at, updated_at)
             VALUES (:uuid, :title, :description, :icon, :color, :target_value, :due_date, :created_by_member_uuid, :created_at, :updated_at)'
        );
        $statement->execute($data);
    }

    /** @param array<string, mixed> $data */
    public function update(string $uuid, array $data): bool
    {
        $statement = $this->database->prepare(
            'UPDATE family_goals SET title = :title, description = :description, icon = :icon,
             color = :color, target_value = :target_value, due_date = :due_date, updated_at = :updated_at
             WHERE uuid = :uuid AND deleted_at IS NULL AND completed_at IS NULL'
        );
        $statement->execute($data + ['uuid' => $uuid]);
        return $statement->rowCount() === 1;
    }

    /** @param array<string, mixed> $entry */
    public function contribute(string $uuid, array $entry): int
    {
        $this->database->exec('BEGIN IMMEDIATE');
        try {
            $goal = $this->database->prepare(
                'SELECT goal.target_value, goal.completed_at, COALESCE(SUM(contribution.amount), 0) AS current_value
                 FROM family_goals goal LEFT JOIN family_goal_contributions contribution ON contribution.goal_uuid = goal.uuid
                 WHERE goal.uuid = :uuid AND goal.deleted_at IS NULL GROUP BY goal.id LIMIT 1'
            );
            $goal->execute(['uuid' => $uuid]);
            $row = $goal->fetch();
            if ($row === false || $row['completed_at'] !== null) { $this->database->exec('ROLLBACK'); return 0; }
            $remaining = (int) $row['target_value'] - (int) $row['current_value'];
            $amount = min((int) $entry['amount'], $remaining);
            if ($amount < 1) { $this->database->exec('ROLLBACK'); return 0; }
            $statement = $this->database->prepare(
                'INSERT INTO family_goal_contributions (uuid, goal_uuid, member_uuid, amount, note, created_at)
                 VALUES (:uuid, :goal_uuid, :member_uuid, :amount, :note, :created_at)'
            );
            $payload = $entry;
            $payload['goal_uuid'] = $uuid;
            $payload['amount'] = $amount;
            $statement->execute($payload);
            if ($amount >= $remaining) {
                $completed = $this->database->prepare('UPDATE family_goals SET completed_at = :completed_at, updated_at = :completed_at WHERE uuid = :uuid AND completed_at IS NULL');
                $completed->execute(['uuid' => $uuid, 'completed_at' => $entry['created_at']]);
            }
            $this->database->exec('COMMIT');
            return $amount;
        } catch (\Throwable $error) {
            try { $this->database->exec('ROLLBACK'); } catch (\Throwable) {}
            throw $error;
        }
    }

    public function softDelete(string $uuid): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare('UPDATE family_goals SET deleted_at = :now, updated_at = :now WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute(['uuid' => $uuid, 'now' => $now]);
        return $statement->rowCount() === 1;
    }

    public function activeCount(): int
    {
        return (int) $this->database->query('SELECT COUNT(*) FROM family_goals WHERE deleted_at IS NULL AND completed_at IS NULL')->fetchColumn();
    }

    private function goalSelect(): string
    {
        return 'SELECT goal.*, COALESCE(SUM(contribution.amount), 0) AS current_value
                FROM family_goals goal LEFT JOIN family_goal_contributions contribution ON contribution.goal_uuid = goal.uuid';
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapGoal(array $row): array
    {
        return [
            'id' => $row['uuid'], 'title' => $row['title'], 'description' => $row['description'],
            'icon' => $row['icon'], 'color' => $row['color'], 'targetValue' => (int) $row['target_value'],
            'currentValue' => (int) $row['current_value'], 'dueDate' => $row['due_date'],
            'completedAt' => $row['completed_at'], 'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at'],
        ];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapActivity(array $row): array
    {
        return [
            'id' => $row['uuid'], 'goalId' => $row['goal_uuid'], 'goalTitle' => $row['goal_title'], 'goalIcon' => $row['goal_icon'],
            'amount' => (int) $row['amount'], 'note' => $row['note'], 'createdAt' => $row['created_at'],
            'member' => ['id' => $row['member_uuid'], 'name' => $row['member_name'], 'color' => $row['member_color']],
        ];
    }
}
