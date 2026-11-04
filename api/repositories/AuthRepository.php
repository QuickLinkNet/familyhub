<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class AuthRepository
{
    public function __construct(private PDO $database) {}

    /** @return list<array<string, mixed>> */
    public function profiles(): array
    {
        return $this->database
            ->query("SELECT uuid AS id, name, color, role, CASE WHEN role = 'CHILD' THEN pin_hash IS NOT NULL ELSE password_hash IS NOT NULL END AS requiresSecret FROM family_members WHERE is_active = 1 AND deleted_at IS NULL ORDER BY CASE role WHEN 'ADMIN' THEN 0 WHEN 'PARENT' THEN 1 ELSE 2 END, name COLLATE NOCASE")
            ->fetchAll();
    }

    /** @return array<string, mixed>|null */
    public function credential(string $uuid): ?array
    {
        $statement = $this->database->prepare('SELECT uuid AS id, name, color, role, pin_hash, password_hash FROM family_members WHERE uuid = :uuid AND is_active = 1 AND deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    /** @return array{attempts: int, locked_until: ?string}|null */
    public function loginAttempt(string $identifier): ?array
    {
        $statement = $this->database->prepare('SELECT attempts, locked_until FROM auth_login_attempts WHERE identifier = :identifier LIMIT 1');
        $statement->execute(['identifier' => $identifier]);
        $row = $statement->fetch();
        return $row === false ? null : ['attempts' => (int) $row['attempts'], 'locked_until' => $row['locked_until']];
    }

    public function saveLoginAttempt(string $identifier, int $attempts, ?string $lockedUntil): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO auth_login_attempts (identifier, attempts, locked_until, updated_at) VALUES (:identifier, :attempts, :locked_until, :updated_at)
             ON CONFLICT(identifier) DO UPDATE SET attempts = excluded.attempts, locked_until = excluded.locked_until, updated_at = excluded.updated_at'
        );
        $statement->execute([
            'identifier' => $identifier,
            'attempts' => $attempts,
            'locked_until' => $lockedUntil,
            'updated_at' => gmdate('c'),
        ]);
    }

    public function clearLoginAttempt(string $identifier): void
    {
        $statement = $this->database->prepare('DELETE FROM auth_login_attempts WHERE identifier = :identifier');
        $statement->execute(['identifier' => $identifier]);
    }
}
