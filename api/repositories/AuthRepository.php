<?php
declare(strict_types=1);

namespace FamilyHub\Repositories;

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

    /** @param array<string, string> $data */
    public function createInvitation(array $data): void
    {
        $this->database->beginTransaction();
        try {
            $now = $data['created_at'];
            $expire = $this->database->prepare('UPDATE auth_invitations SET redeemed_at = :now WHERE member_uuid = :member_uuid AND redeemed_at IS NULL');
            $expire->execute(['now' => $now, 'member_uuid' => $data['member_uuid']]);
            $statement = $this->database->prepare(
                'INSERT INTO auth_invitations (uuid, member_uuid, created_by_member_uuid, token_hash, expires_at, created_at)
                 VALUES (:uuid, :member_uuid, :created_by_member_uuid, :token_hash, :expires_at, :created_at)'
            );
            $statement->execute($data);
            $this->database->commit();
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    /** @return array<string, mixed>|null */
    public function invitation(string $tokenHash): ?array
    {
        $statement = $this->database->prepare(
            "SELECT invitation.uuid, invitation.member_uuid, invitation.expires_at, invitation.redeemed_at,
                    member.name, member.color, member.role, member.is_active
             FROM auth_invitations invitation
             INNER JOIN family_members member ON member.uuid = invitation.member_uuid
             WHERE invitation.token_hash = :token_hash AND member.deleted_at IS NULL
             LIMIT 1"
        );
        $statement->execute(['token_hash' => $tokenHash]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    public function redeemInvitation(string $uuid, string $redeemedAt): bool
    {
        $statement = $this->database->prepare(
            'UPDATE auth_invitations SET redeemed_at = :redeemed_at
             WHERE uuid = :uuid AND redeemed_at IS NULL AND expires_at > :redeemed_at'
        );
        $statement->execute(['uuid' => $uuid, 'redeemed_at' => $redeemedAt]);
        return $statement->rowCount() === 1;
    }

    /** @param array<string, string> $data */
    public function registerDevice(array $data): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO auth_devices (uuid, member_uuid, session_hash, label, user_agent, created_at, last_seen_at)
             VALUES (:uuid, :member_uuid, :session_hash, :label, :user_agent, :created_at, :last_seen_at)
             ON CONFLICT(session_hash) DO UPDATE SET member_uuid = excluded.member_uuid, label = excluded.label,
                 user_agent = excluded.user_agent, last_seen_at = excluded.last_seen_at, revoked_at = NULL'
        );
        $statement->execute($data);
    }

    public function deviceIsActive(string $uuid, string $memberUuid, string $sessionHash): bool
    {
        $statement = $this->database->prepare(
            'SELECT 1 FROM auth_devices WHERE uuid = :uuid AND member_uuid = :member_uuid
             AND session_hash = :session_hash AND revoked_at IS NULL LIMIT 1'
        );
        $statement->execute(['uuid' => $uuid, 'member_uuid' => $memberUuid, 'session_hash' => $sessionHash]);
        return $statement->fetchColumn() !== false;
    }

    public function touchDevice(string $uuid, string $seenAt): void
    {
        $statement = $this->database->prepare('UPDATE auth_devices SET last_seen_at = :seen_at WHERE uuid = :uuid AND revoked_at IS NULL');
        $statement->execute(['uuid' => $uuid, 'seen_at' => $seenAt]);
    }

    /** @return list<array<string, mixed>> */
    public function devices(): array
    {
        return $this->database->query(
            "SELECT device.uuid AS id, device.member_uuid AS member_id, member.name AS member_name,
                    member.color AS member_color, device.label, device.user_agent, device.created_at,
                    device.last_seen_at, device.revoked_at
             FROM auth_devices device
             INNER JOIN family_members member ON member.uuid = device.member_uuid
             ORDER BY device.revoked_at IS NOT NULL, device.last_seen_at DESC"
        )->fetchAll();
    }

    public function revokeDevice(string $uuid, string $revokedAt): bool
    {
        $statement = $this->database->prepare(
            'UPDATE auth_devices SET revoked_at = :revoked_at WHERE uuid = :uuid AND revoked_at IS NULL'
        );
        $statement->execute(['uuid' => $uuid, 'revoked_at' => $revokedAt]);
        return $statement->rowCount() === 1;
    }
}
