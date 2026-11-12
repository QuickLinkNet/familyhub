<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\PublicUrl;
use FamilyCompass\Core\SecretCipher;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\PushRepository;

final class PushService
{
    private const TOKEN_SETTING = 'push_dispatch_token_encrypted';
    private const LAST_DISPATCH_SETTING = 'push_last_dispatch_at';

    public function __construct(
        private PushRepository $repository,
        private FamilyMemberRepository $members,
        private ReminderService $reminders,
        private SecretCipher $cipher,
        private WebPushCrypto $crypto,
        private PublicUrl $urls
    ) {}

    /** @param array{id: string, name: string, color: string, role: string} $actor @return array<string, mixed> */
    public function status(array $actor): array
    {
        $keys = $this->keys();
        $devices = array_map(static fn (array $row): array => [
            'id' => $row['uuid'],
            'label' => $row['device_label'],
            'createdAt' => $row['created_at'],
            'lastSuccessAt' => $row['last_success_at'],
            'lastErrorAt' => $row['last_error_at'],
        ], $this->repository->activeForMember($actor['id']));
        return ['publicKey' => $keys['publicKey'], 'devices' => $devices];
    }

    /** @param array{id: string, name: string, color: string, role: string} $actor @param array<string, mixed> $input */
    public function subscribe(array $actor, array $input, string $userAgent): array
    {
        $endpoint = trim((string) ($input['endpoint'] ?? ''));
        $p256dh = trim((string) ($input['keys']['p256dh'] ?? ''));
        $auth = trim((string) ($input['keys']['auth'] ?? ''));
        $label = trim((string) ($input['deviceLabel'] ?? 'Dieses Gerät'));
        $clientKey = $this->base64UrlDecode($p256dh);
        $authKey = $this->base64UrlDecode($auth);
        if (strlen($endpoint) < 20 || strlen($endpoint) > 2_048 || filter_var($endpoint, FILTER_VALIDATE_URL) === false || !str_starts_with(strtolower($endpoint), 'https://')) {
            throw new AppException('VALIDATION_ERROR', 'Der Push-Endpunkt ist ungültig.', 422);
        }
        if (strlen($clientKey) !== 65 || $clientKey[0] !== "\x04" || strlen($authKey) !== 16) {
            throw new AppException('VALIDATION_ERROR', 'Die Browser-Pushschlüssel sind ungültig.', 422);
        }
        if ($label === '' || mb_strlen($label) > 60) { throw new AppException('VALIDATION_ERROR', 'Der Gerätename darf höchstens 60 Zeichen lang sein.', 422); }
        $now = gmdate('c');
        $this->repository->upsertSubscription([
            'uuid' => $this->uuid(), 'member_uuid' => $actor['id'], 'endpoint_hash' => $this->cipher->fingerprint($endpoint),
            'endpoint_encrypted' => $this->cipher->encrypt($endpoint), 'p256dh_encrypted' => $this->cipher->encrypt($p256dh),
            'auth_encrypted' => $this->cipher->encrypt($auth), 'device_label' => $label,
            'user_agent' => mb_substr($userAgent, 0, 500), 'created_at' => $now, 'updated_at' => $now,
        ]);
        return $this->status($actor);
    }

    /** @param array{id: string, name: string, color: string, role: string} $actor */
    public function unsubscribe(array $actor, array $input): void
    {
        $endpoint = trim((string) ($input['endpoint'] ?? ''));
        if ($endpoint === '' || !$this->repository->revoke($actor['id'], $this->cipher->fingerprint($endpoint))) {
            throw new AppException('NOT_FOUND', 'Dieses Gerät war nicht für Push aktiviert.', 404);
        }
    }

    /** @param array{id: string, name: string, color: string, role: string} $actor @return array{delivered: int, failed: int} */
    public function test(array $actor): array
    {
        $subscriptions = $this->repository->activeForMember($actor['id']);
        if ($subscriptions === []) { throw new AppException('PUSH_NOT_SUBSCRIBED', 'Aktiviere Push zuerst auf diesem Gerät.', 409); }
        return $this->deliver($subscriptions, [
            'title' => 'FamilyHub erreicht dich',
            'body' => 'Echte Erinnerungen funktionieren jetzt auch bei geschlossener App.',
            'href' => '/', 'tag' => 'familyhub-push-test',
        ]);
    }

    /** @return array<string, mixed> */
    public function administration(): array
    {
        $token = $this->dispatchToken();
        return $this->repository->statistics() + [
            'schedulerUrl' => $this->urls->api('push/dispatch') . '?token=' . rawurlencode($token),
            'lastDispatchAt' => $this->repository->setting(self::LAST_DISPATCH_SETTING),
            'recommendedIntervalMinutes' => 5,
        ];
    }

    /** @return array<string, int> */
    public function dispatchWithToken(string $token): array
    {
        $expected = $this->dispatchToken();
        if ($token === '' || !hash_equals($expected, $token)) { throw new AppException('PUSH_TOKEN_INVALID', 'Der Scheduler-Schlüssel ist ungültig.', 403); }
        return $this->dispatchAll();
    }

    /** @return array{members: int, delivered: int, failed: int} */
    public function dispatchAll(): array
    {
        $subscriptions = $this->repository->allActive();
        $groups = [];
        foreach ($subscriptions as $subscription) { $groups[(string) $subscription['member_uuid']][] = $subscription; }
        $result = ['members' => 0, 'delivered' => 0, 'failed' => 0];
        foreach ($groups as $memberId => $memberSubscriptions) {
            $member = $this->members->find($memberId);
            if ($member === null || !$member->isActive) { continue; }
            $actor = ['id' => $member->uuid, 'name' => $member->name, 'color' => $member->color, 'role' => $member->role];
            $items = array_values(array_filter($this->reminders->overview($actor)['items'] ?? [], static fn (array $item): bool => in_array($item['urgency'] ?? '', ['CRITICAL', 'ATTENTION'], true)));
            if ($items === []) { continue; }
            $fingerprint = hash('sha256', json_encode(array_map(static fn (array $item): array => [$item['id'] ?? '', $item['urgency'] ?? '', $item['dueAt'] ?? ''], $items), JSON_THROW_ON_ERROR));
            $pending = array_values(array_filter($memberSubscriptions, fn (array $subscription): bool => !$this->repository->wasDelivered((string) $subscription['uuid'], $fingerprint)));
            if ($pending === []) { continue; }
            $first = $items[0];
            $payload = [
                'title' => count($items) === 1 ? (string) $first['title'] : count($items) . ' Dinge brauchen Aufmerksamkeit',
                'body' => count($items) === 1 ? (string) $first['message'] : (string) $first['title'] . ' und ' . (count($items) - 1) . ' weitere Hinweise',
                'href' => (string) ($first['action']['href'] ?? '/'), 'tag' => 'familyhub-reminders',
            ];
            $delivery = $this->deliver($pending, $payload, $fingerprint);
            $result['members']++; $result['delivered'] += $delivery['delivered']; $result['failed'] += $delivery['failed'];
        }
        $this->repository->cleanupDeliveries();
        $this->repository->saveSetting(self::LAST_DISPATCH_SETTING, gmdate('c'));
        return $result;
    }

    /** @param list<array<string, mixed>> $subscriptions @param array<string, string> $payload @return array{delivered: int, failed: int} */
    private function deliver(array $subscriptions, array $payload, ?string $fingerprint = null): array
    {
        $keys = $this->keys();
        $result = ['delivered' => 0, 'failed' => 0];
        foreach ($subscriptions as $subscription) {
            try {
                $status = $this->crypto->send([
                    'endpoint' => $this->cipher->decrypt((string) $subscription['endpoint_encrypted']),
                    'p256dh' => $this->cipher->decrypt((string) $subscription['p256dh_encrypted']),
                    'auth' => $this->cipher->decrypt((string) $subscription['auth_encrypted']),
                ], $keys['privatePem'], $keys['publicKey'], $keys['subject'], $payload);
                if (!in_array($status, [200, 201, 202], true)) {
                    $this->repository->markFailure((string) $subscription['uuid'], 'Pushdienst antwortete mit HTTP ' . $status, in_array($status, [404, 410], true));
                    $result['failed']++; continue;
                }
                $this->repository->markSuccess((string) $subscription['uuid']);
                if ($fingerprint !== null) { $this->repository->recordDelivery((string) $subscription['uuid'], $fingerprint); }
                $result['delivered']++;
            } catch (\Throwable $exception) {
                $this->repository->markFailure((string) $subscription['uuid'], $exception->getMessage(), false);
                $result['failed']++;
            }
        }
        return $result;
    }

    /** @return array{privatePem: string, publicKey: string, subject: string} */
    private function keys(): array
    {
        $stored = $this->repository->vapidKeys();
        if ($stored === null) {
            $pair = $this->crypto->generateKeyPair();
            $now = gmdate('c');
            $subject = $this->urls->appBase();
            $this->repository->saveVapidKeys(['public_key' => $pair['publicKey'], 'private_key_encrypted' => $this->cipher->encrypt($pair['privatePem']), 'subject' => $subject, 'created_at' => $now, 'updated_at' => $now]);
            return $pair + ['subject' => $subject];
        }
        return ['privatePem' => $this->cipher->decrypt((string) $stored['private_key_encrypted']), 'publicKey' => (string) $stored['public_key'], 'subject' => (string) $stored['subject']];
    }

    private function dispatchToken(): string
    {
        $encrypted = $this->repository->setting(self::TOKEN_SETTING);
        if ($encrypted !== null) { return $this->cipher->decrypt($encrypted); }
        $token = bin2hex(random_bytes(32));
        $this->repository->saveSetting(self::TOKEN_SETTING, $this->cipher->encrypt($token));
        return $token;
    }

    private function base64UrlDecode(string $value): string
    {
        $decoded = base64_decode(strtr($value, '-_', '+/') . str_repeat('=', (4 - strlen($value) % 4) % 4), true);
        return $decoded === false ? '' : $decoded;
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes); return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
