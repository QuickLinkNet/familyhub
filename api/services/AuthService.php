<?php
declare(strict_types=1);

namespace FamilyHub\Services;

use FamilyHub\Core\AppException;
use FamilyHub\Core\PublicUrl;
use FamilyHub\Repositories\AuthRepository;

final class AuthService
{
    private const ADULT_ROLES = ['ADMIN', 'PARENT'];
    private const MAX_ATTEMPTS = 5;
    private const LOCK_SECONDS = 300;
    private const INVITATION_SECONDS = 600;
    private const DEVICE_TOUCH_SECONDS = 300;

    public function __construct(private AuthRepository $repository, private PublicUrl $urls) {}

    /** @return list<array<string, mixed>> */
    public function profiles(): array
    {
        return array_map(static fn (array $profile): array => [
            'id' => $profile['id'],
            'name' => $profile['name'],
            'color' => $profile['color'],
            'role' => $profile['role'],
            'requiresSecret' => (bool) $profile['requiresSecret'],
        ], $this->repository->profiles());
    }

    /** @return array<string, mixed> */
    public function session(): array
    {
        $user = $this->currentUser();
        return [
            'authenticated' => $user !== null,
            'user' => $user,
            'csrfToken' => $user === null ? null : $this->csrfToken(),
        ];
    }

    /** @param array<string, mixed> $input */
    public function login(array $input): array
    {
        $memberId = trim((string) ($input['memberId'] ?? ''));
        $secret = (string) ($input['secret'] ?? '');
        if ($memberId === '' || strlen($memberId) > 64 || strlen($secret) > 128) {
            throw new AppException('VALIDATION_ERROR', 'Profil und Zugangsdaten sind erforderlich.', 422);
        }

        $identifier = hash('sha256', $this->clientAddress() . '|' . $memberId);
        $attempt = $this->repository->loginAttempt($identifier);
        if ($attempt !== null && $attempt['locked_until'] !== null && strtotime($attempt['locked_until']) > time()) {
            throw new AppException('LOGIN_RATE_LIMITED', 'Zu viele Fehlversuche. Bitte in fünf Minuten erneut versuchen.', 429);
        }
        if ($attempt !== null && $attempt['locked_until'] !== null) {
            $attempt = null;
            $this->repository->clearLoginAttempt($identifier);
        }

        $credential = $this->repository->credential($memberId);
        if ($credential === null) {
            throw new AppException('INVALID_CREDENTIALS', 'Die Zugangsdaten sind nicht korrekt.', 401);
        }

        $hash = $credential['role'] === 'CHILD' ? $credential['pin_hash'] : $credential['password_hash'];
        $valid = $hash === null
            ? ($credential['role'] === 'CHILD' && $secret === '')
            : password_verify($secret, $hash);

        if (!$valid) {
            $nextAttempts = ($attempt['attempts'] ?? 0) + 1;
            $lockedUntil = $nextAttempts >= self::MAX_ATTEMPTS ? gmdate('c', time() + self::LOCK_SECONDS) : null;
            $this->repository->saveLoginAttempt($identifier, $nextAttempts, $lockedUntil);
            if ($lockedUntil !== null) {
                throw new AppException('LOGIN_RATE_LIMITED', 'Zu viele Fehlversuche. Bitte in fünf Minuten erneut versuchen.', 429);
            }
            throw new AppException('INVALID_CREDENTIALS', 'Die Zugangsdaten sind nicht korrekt.', 401);
        }

        $this->repository->clearLoginAttempt($identifier);
        $this->startSession($credential['id'], $this->deviceLabel($input));

        return $this->session();
    }

    /** @param array{id: string, name: string, color: string, role: string} $actor
     *  @param array<string, mixed> $input
     *  @return array<string, mixed>
     */
    public function createInvitation(array $actor, array $input): array
    {
        $memberId = trim((string) ($input['memberId'] ?? ''));
        $credential = $memberId === '' ? null : $this->repository->credential($memberId);
        if ($credential === null) {
            throw new AppException('MEMBER_NOT_FOUND', 'Das ausgewählte Familienprofil ist nicht aktiv.', 404);
        }
        $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        $now = gmdate('c');
        $expiresAt = gmdate('c', time() + self::INVITATION_SECONDS);
        $this->repository->createInvitation([
            'uuid' => $this->uuid(),
            'member_uuid' => $memberId,
            'created_by_member_uuid' => $actor['id'],
            'token_hash' => hash('sha256', $token),
            'expires_at' => $expiresAt,
            'created_at' => $now,
        ]);
        return [
            'url' => $this->urls->app('join?token=' . rawurlencode($token)),
            'expiresAt' => $expiresAt,
            'profile' => $this->profile($credential),
        ];
    }

    /** @return array<string, mixed> */
    public function invitation(string $token): array
    {
        $row = $this->validInvitation($token);
        return [
            'expiresAt' => $row['expires_at'],
            'profile' => [
                'id' => $row['member_uuid'],
                'name' => $row['name'],
                'color' => $row['color'],
                'role' => $row['role'],
            ],
        ];
    }

    /** @param array<string, mixed> $input
     *  @return array<string, mixed>
     */
    public function redeemInvitation(string $token, array $input): array
    {
        $row = $this->validInvitation($token);
        $now = gmdate('c');
        if (!$this->repository->redeemInvitation((string) $row['uuid'], $now)) {
            throw new AppException('INVITATION_UNAVAILABLE', 'Dieser Freigabelink wurde bereits verwendet oder ist abgelaufen.', 410);
        }
        $this->startSession((string) $row['member_uuid'], $this->deviceLabel($input));
        return $this->session();
    }

    /** @return list<array<string, mixed>> */
    public function devices(): array
    {
        $current = $_SESSION['auth_device_uuid'] ?? null;
        return array_map(static fn (array $row): array => [
            'id' => $row['id'],
            'profile' => ['id' => $row['member_id'], 'name' => $row['member_name'], 'color' => $row['member_color']],
            'label' => $row['label'],
            'createdAt' => $row['created_at'],
            'lastSeenAt' => $row['last_seen_at'],
            'revokedAt' => $row['revoked_at'],
            'current' => is_string($current) && hash_equals($current, (string) $row['id']),
        ], $this->repository->devices());
    }

    public function revokeDevice(string $uuid): void
    {
        if (!preg_match('/^[0-9a-f-]{36}$/', $uuid)) {
            throw new AppException('VALIDATION_ERROR', 'Die Gerätekennung ist ungültig.', 422);
        }
        if (($_SESSION['auth_device_uuid'] ?? null) === $uuid) {
            throw new AppException('CURRENT_DEVICE_FORBIDDEN', 'Das aktuell verwendete Gerät kann hier nicht abgemeldet werden.', 409);
        }
        if (!$this->repository->revokeDevice($uuid, gmdate('c'))) {
            throw new AppException('DEVICE_NOT_FOUND', 'Das Gerät wurde nicht gefunden oder ist bereits abgemeldet.', 404);
        }
    }

    /** @return array{id: string, name: string, color: string, role: string}|null */
    public function currentUser(): ?array
    {
        $memberId = $_SESSION['auth_member_uuid'] ?? null;
        if (!is_string($memberId) || $memberId === '') {
            return null;
        }
        $credential = $this->repository->credential($memberId);
        if ($credential === null) {
            $this->clearSession();
            return null;
        }
        if (!$this->ensureActiveDevice($memberId)) {
            $this->clearSession();
            return null;
        }
        return $this->profile($credential);
    }

    /** @param list<string> $roles
     *  @return array{id: string, name: string, color: string, role: string}
     */
    public function requireUser(array $roles = []): array
    {
        $user = $this->currentUser();
        if ($user === null) {
            throw new AppException('AUTHENTICATION_REQUIRED', 'Bitte zuerst anmelden.', 401);
        }
        if ($roles !== [] && !in_array($user['role'], $roles, true)) {
            throw new AppException('FORBIDDEN', 'Für diese Aktion fehlen die erforderlichen Rechte.', 403);
        }
        return $user;
    }

    public function requireAdult(): array
    {
        return $this->requireUser(self::ADULT_ROLES);
    }

    public function requireAdmin(): array
    {
        return $this->requireUser(['ADMIN']);
    }

    public function requireCsrf(): void
    {
        $expected = $_SESSION['csrf_token'] ?? null;
        $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
        if (!is_string($expected) || !is_string($provided) || !hash_equals($expected, $provided)) {
            throw new AppException('CSRF_INVALID', 'Die Sicherheitsprüfung ist abgelaufen. Bitte neu anmelden.', 403);
        }
    }

    public function logout(): void
    {
        $deviceUuid = $_SESSION['auth_device_uuid'] ?? null;
        if (is_string($deviceUuid) && $deviceUuid !== '') {
            $this->repository->revokeDevice($deviceUuid, gmdate('c'));
        }
        $this->clearSession();
    }

    private function csrfToken(): string
    {
        $token = $_SESSION['csrf_token'] ?? null;
        if (!is_string($token) || $token === '') {
            $token = bin2hex(random_bytes(32));
            $_SESSION['csrf_token'] = $token;
        }
        return $token;
    }

    /** @param array<string, mixed> $credential
     *  @return array{id: string, name: string, color: string, role: string}
     */
    private function profile(array $credential): array
    {
        return [
            'id' => $credential['id'],
            'name' => $credential['name'],
            'color' => $credential['color'],
            'role' => $credential['role'],
        ];
    }

    private function clearSession(): void
    {
        $_SESSION = [];
        if (session_status() === PHP_SESSION_ACTIVE) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $params['path'],
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite'] ?? 'Lax',
            ]);
            session_destroy();
        }
    }

    private function clientAddress(): string
    {
        return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    }

    /** @param array<string, mixed> $input */
    private function deviceLabel(array $input): string
    {
        $label = trim((string) ($input['deviceLabel'] ?? ''));
        if ($label === '') {
            $agent = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
            $label = preg_match('/iPad|iPhone|iPod/i', $agent) ? 'iPhone / iPad'
                : (preg_match('/Android/i', $agent) ? 'Android-Gerät'
                    : (preg_match('/Windows/i', $agent) ? 'Windows-Browser'
                        : (preg_match('/Macintosh/i', $agent) ? 'Mac-Browser' : 'Familiengerät')));
        }
        if (mb_strlen($label) > 60) {
            throw new AppException('VALIDATION_ERROR', 'Der Gerätename darf höchstens 60 Zeichen lang sein.', 422);
        }
        return $label;
    }

    private function startSession(string $memberId, string $label): void
    {
        session_regenerate_id(true);
        $_SESSION['auth_member_uuid'] = $memberId;
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['authenticated_at'] = time();
        $deviceUuid = $this->uuid();
        $now = gmdate('c');
        $this->repository->registerDevice([
            'uuid' => $deviceUuid,
            'member_uuid' => $memberId,
            'session_hash' => $this->sessionHash(),
            'label' => $label,
            'user_agent' => mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 500),
            'created_at' => $now,
            'last_seen_at' => $now,
        ]);
        $_SESSION['auth_device_uuid'] = $deviceUuid;
        $_SESSION['auth_device_touched_at'] = time();
    }

    private function ensureActiveDevice(string $memberId): bool
    {
        $deviceUuid = $_SESSION['auth_device_uuid'] ?? null;
        if (!is_string($deviceUuid) || $deviceUuid === '') {
            $this->startSession($memberId, 'Bestehender Browser');
            return true;
        }
        if (!$this->repository->deviceIsActive($deviceUuid, $memberId, $this->sessionHash())) {
            return false;
        }
        $lastTouch = (int) ($_SESSION['auth_device_touched_at'] ?? 0);
        if (time() - $lastTouch >= self::DEVICE_TOUCH_SECONDS) {
            $this->repository->touchDevice($deviceUuid, gmdate('c'));
            $_SESSION['auth_device_touched_at'] = time();
        }
        return true;
    }

    /** @return array<string, mixed> */
    private function validInvitation(string $token): array
    {
        if (!preg_match('/^[A-Za-z0-9_-]{43}$/', $token)) {
            throw new AppException('INVITATION_UNAVAILABLE', 'Dieser Freigabelink ist ungültig oder abgelaufen.', 410);
        }
        $row = $this->repository->invitation(hash('sha256', $token));
        if ($row === null || $row['redeemed_at'] !== null || !(bool) $row['is_active'] || strtotime((string) $row['expires_at']) <= time()) {
            throw new AppException('INVITATION_UNAVAILABLE', 'Dieser Freigabelink ist ungültig, abgelaufen oder wurde bereits verwendet.', 410);
        }
        return $row;
    }

    private function sessionHash(): string
    {
        return hash('sha256', session_id());
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
