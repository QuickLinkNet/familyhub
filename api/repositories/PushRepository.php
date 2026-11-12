<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class PushRepository
{
    public function __construct(private PDO $database) {}

    /** @return array<string, mixed>|null */
    public function vapidKeys(): ?array
    {
        $row = $this->database->query('SELECT * FROM push_vapid_keys WHERE id = 1')->fetch();
        return $row === false ? null : $row;
    }

    /** @param array<string, string> $data */
    public function saveVapidKeys(array $data): void
    {
        $statement = $this->database->prepare('INSERT INTO push_vapid_keys (id, public_key, private_key_encrypted, subject, created_at, updated_at) VALUES (1, :public_key, :private_key_encrypted, :subject, :created_at, :updated_at)');
        $statement->execute($data);
    }

    /** @param array<string, mixed> $data */
    public function upsertSubscription(array $data): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO push_subscriptions (uuid, member_uuid, endpoint_hash, endpoint_encrypted, p256dh_encrypted, auth_encrypted, device_label, user_agent, created_at, updated_at)
             VALUES (:uuid, :member_uuid, :endpoint_hash, :endpoint_encrypted, :p256dh_encrypted, :auth_encrypted, :device_label, :user_agent, :created_at, :updated_at)
             ON CONFLICT(endpoint_hash) DO UPDATE SET member_uuid = excluded.member_uuid, endpoint_encrypted = excluded.endpoint_encrypted,
                p256dh_encrypted = excluded.p256dh_encrypted, auth_encrypted = excluded.auth_encrypted,
                device_label = excluded.device_label, user_agent = excluded.user_agent, updated_at = excluded.updated_at,
                failure_count = 0, last_error = NULL, last_error_at = NULL, revoked_at = NULL'
        );
        $statement->execute($data);
    }

    /** @return list<array<string, mixed>> */
    public function activeForMember(string $memberId): array
    {
        $statement = $this->database->prepare('SELECT * FROM push_subscriptions WHERE member_uuid = :member_uuid AND revoked_at IS NULL ORDER BY updated_at DESC');
        $statement->execute(['member_uuid' => $memberId]);
        return $statement->fetchAll();
    }

    /** @return list<array<string, mixed>> */
    public function allActive(): array
    {
        return $this->database->query('SELECT * FROM push_subscriptions WHERE revoked_at IS NULL ORDER BY member_uuid, updated_at DESC')->fetchAll();
    }

    public function revoke(string $memberId, string $endpointHash): bool
    {
        $statement = $this->database->prepare('UPDATE push_subscriptions SET revoked_at = :revoked_at, updated_at = :updated_at WHERE member_uuid = :member_uuid AND endpoint_hash = :endpoint_hash AND revoked_at IS NULL');
        $now = gmdate('c');
        $statement->execute(['revoked_at' => $now, 'updated_at' => $now, 'member_uuid' => $memberId, 'endpoint_hash' => $endpointHash]);
        return $statement->rowCount() === 1;
    }

    public function markSuccess(string $uuid): void
    {
        $statement = $this->database->prepare('UPDATE push_subscriptions SET last_success_at = :now, last_error_at = NULL, last_error = NULL, failure_count = 0, updated_at = :now WHERE uuid = :uuid');
        $statement->execute(['now' => gmdate('c'), 'uuid' => $uuid]);
    }

    public function markFailure(string $uuid, string $message, bool $revoke): void
    {
        $statement = $this->database->prepare('UPDATE push_subscriptions SET last_error_at = :now, last_error = :message, failure_count = failure_count + 1, revoked_at = CASE WHEN :revoke = 1 THEN :now ELSE revoked_at END, updated_at = :now WHERE uuid = :uuid');
        $statement->execute(['now' => gmdate('c'), 'message' => mb_substr($message, 0, 240), 'revoke' => $revoke ? 1 : 0, 'uuid' => $uuid]);
    }

    public function wasDelivered(string $subscriptionUuid, string $fingerprint): bool
    {
        $statement = $this->database->prepare('SELECT 1 FROM push_deliveries WHERE subscription_uuid = :subscription_uuid AND reminder_fingerprint = :fingerprint LIMIT 1');
        $statement->execute(['subscription_uuid' => $subscriptionUuid, 'fingerprint' => $fingerprint]);
        return $statement->fetchColumn() !== false;
    }

    public function recordDelivery(string $subscriptionUuid, string $fingerprint): void
    {
        $statement = $this->database->prepare('INSERT OR IGNORE INTO push_deliveries (subscription_uuid, reminder_fingerprint, sent_at) VALUES (:subscription_uuid, :fingerprint, :sent_at)');
        $statement->execute(['subscription_uuid' => $subscriptionUuid, 'fingerprint' => $fingerprint, 'sent_at' => gmdate('c')]);
    }

    public function cleanupDeliveries(): void
    {
        $statement = $this->database->prepare('DELETE FROM push_deliveries WHERE sent_at < :before');
        $statement->execute(['before' => gmdate('c', time() - 45 * 86400)]);
    }

    public function setting(string $key): ?string
    {
        $statement = $this->database->prepare('SELECT setting_value FROM app_settings WHERE setting_key = :key LIMIT 1');
        $statement->execute(['key' => $key]);
        $value = $statement->fetchColumn();
        return is_string($value) ? $value : null;
    }

    public function saveSetting(string $key, string $value): void
    {
        $statement = $this->database->prepare('INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) VALUES (:key, :value, :now, :now) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = excluded.updated_at');
        $statement->execute(['key' => $key, 'value' => $value, 'now' => gmdate('c')]);
    }

    /** @return array{active: int, lastSuccessAt: string|null, lastErrorAt: string|null} */
    public function statistics(): array
    {
        $row = $this->database->query('SELECT COUNT(*) AS active, MAX(last_success_at) AS last_success_at, MAX(last_error_at) AS last_error_at FROM push_subscriptions WHERE revoked_at IS NULL')->fetch();
        return ['active' => (int) ($row['active'] ?? 0), 'lastSuccessAt' => $row['last_success_at'] ?? null, 'lastErrorAt' => $row['last_error_at'] ?? null];
    }
}
