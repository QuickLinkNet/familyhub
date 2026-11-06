<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class RewardRepository
{
    public function __construct(private PDO $database) {}

    /** @return array<string, mixed> */
    public function dashboard(): array
    {
        $balances = $this->database->query(
            'SELECT fm.uuid AS member_id, fm.name, fm.color, fm.role, fm.avatar_url,
                    COALESCE(SUM(rl.points_delta), 0) AS points
             FROM family_members fm
             LEFT JOIN reward_ledger rl ON rl.member_uuid = fm.uuid
             WHERE fm.deleted_at IS NULL AND fm.is_active = 1
             GROUP BY fm.uuid
             ORDER BY points DESC, fm.name COLLATE NOCASE'
        )->fetchAll();

        $rewards = $this->database->query(
            'SELECT * FROM rewards WHERE deleted_at IS NULL AND is_active = 1
             ORDER BY cost_points, title COLLATE NOCASE'
        )->fetchAll();

        $activity = $this->database->query(
            'SELECT rl.*, fm.name AS member_name, fm.color AS member_color,
                    t.title AS task_title, r.title AS reward_title
             FROM reward_ledger rl
             JOIN family_members fm ON fm.uuid = rl.member_uuid
             LEFT JOIN tasks t ON t.uuid = rl.task_uuid
             LEFT JOIN rewards r ON r.uuid = rl.reward_uuid
             ORDER BY rl.created_at DESC, rl.id DESC LIMIT 40'
        )->fetchAll();

        return [
            'balances' => array_map([$this, 'mapBalance'], $balances),
            'rewards' => array_map([$this, 'mapReward'], $rewards),
            'activity' => array_map([$this, 'mapActivity'], $activity),
        ];
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO rewards (uuid, title, description, cost_points, icon, color, is_active, created_by_member_uuid, created_at, updated_at)
             VALUES (:uuid, :title, :description, :cost_points, :icon, :color, 1, :created_by_member_uuid, :created_at, :updated_at)'
        );
        $statement->execute($data);
    }

    public function softDelete(string $uuid): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare(
            'UPDATE rewards SET is_active = 0, deleted_at = :deleted_at, updated_at = :updated_at
             WHERE uuid = :uuid AND deleted_at IS NULL'
        );
        $statement->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount() === 1;
    }

    /** @return array<string, mixed>|null */
    public function find(string $uuid): ?array
    {
        $statement = $this->database->prepare('SELECT * FROM rewards WHERE uuid = :uuid AND deleted_at IS NULL AND is_active = 1 LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    public function balance(string $memberUuid): int
    {
        $statement = $this->database->prepare('SELECT COALESCE(SUM(points_delta), 0) FROM reward_ledger WHERE member_uuid = :member_uuid');
        $statement->execute(['member_uuid' => $memberUuid]);
        return (int) $statement->fetchColumn();
    }

    /** @param array<string, mixed> $entry */
    public function addEntry(array $entry): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO reward_ledger (uuid, member_uuid, task_uuid, reward_uuid, entry_type, points_delta, reason, created_by_member_uuid, created_at)
             VALUES (:uuid, :member_uuid, NULL, :reward_uuid, :entry_type, :points_delta, :reason, :created_by_member_uuid, :created_at)'
        );
        $statement->execute($entry);
    }

    /** @param array<string, mixed> $entry */
    public function redeem(array $entry, int $cost): bool
    {
        $this->database->exec('BEGIN IMMEDIATE');
        try {
            if ($this->balance((string) $entry['member_uuid']) < $cost) {
                $this->database->exec('ROLLBACK');
                return false;
            }
            $this->addEntry($entry);
            $this->database->exec('COMMIT');
            return true;
        } catch (\Throwable $error) {
            try { $this->database->exec('ROLLBACK'); } catch (\Throwable) {}
            throw $error;
        }
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapBalance(array $row): array
    {
        return [
            'member' => ['id' => $row['member_id'], 'name' => $row['name'], 'color' => $row['color'], 'role' => $row['role'], 'avatarUrl' => $row['avatar_url']],
            'points' => (int) $row['points'],
        ];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapReward(array $row): array
    {
        return [
            'id' => $row['uuid'], 'title' => $row['title'], 'description' => $row['description'],
            'costPoints' => (int) $row['cost_points'], 'icon' => $row['icon'], 'color' => $row['color'],
            'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at'],
        ];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapActivity(array $row): array
    {
        return [
            'id' => $row['uuid'], 'memberId' => $row['member_uuid'], 'memberName' => $row['member_name'],
            'memberColor' => $row['member_color'], 'type' => $row['entry_type'], 'points' => (int) $row['points_delta'],
            'reason' => $row['reason'], 'taskTitle' => $row['task_title'], 'rewardTitle' => $row['reward_title'],
            'createdAt' => $row['created_at'],
        ];
    }
}
