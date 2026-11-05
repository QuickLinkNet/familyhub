<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\AuthRepository;

final class AuthService
{
    private const ADULT_ROLES = ['ADMIN', 'PARENT'];
    private const MAX_ATTEMPTS = 5;
    private const LOCK_SECONDS = 300;

    public function __construct(private AuthRepository $repository) {}

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
        session_regenerate_id(true);
        $_SESSION['auth_member_uuid'] = $credential['id'];
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['authenticated_at'] = time();

        return $this->session();
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
}
