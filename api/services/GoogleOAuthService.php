<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\SecretCipher;
use FamilyCompass\Repositories\GoogleOAuthRepository;

final class GoogleOAuthService
{
    private const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
    private const SCOPES = [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
    ];

    public function __construct(
        private GoogleOAuthRepository $repository,
        private SecretCipher $cipher,
        private GoogleApiClient $client
    ) {}

    /** @return array<string, mixed> */
    public function status(string $callbackUrl): array
    {
        $connection = $this->repository->connection();
        $clientId = $connection === null ? null : $this->cipher->decrypt((string) $connection['client_id_encrypted']);
        return [
            'configured' => $connection !== null,
            'connected' => $connection !== null && is_string($connection['refresh_token_encrypted']) && $connection['refresh_token_encrypted'] !== '',
            'clientIdHint' => $clientId === null ? null : $this->clientIdHint($clientId),
            'accountLabel' => $connection['account_label'] ?? null,
            'callbackUrl' => $callbackUrl,
            'scopes' => self::SCOPES,
        ];
    }

    /** @param array<string, mixed> $input */
    public function configure(array $input): void
    {
        $clientId = trim((string) ($input['clientId'] ?? ''));
        $clientSecret = trim((string) ($input['clientSecret'] ?? ''));
        if (strlen($clientId) < 30 || strlen($clientId) > 255 || !str_ends_with($clientId, '.apps.googleusercontent.com')) {
            throw new AppException('VALIDATION_ERROR', 'Bitte eine gültige Google OAuth-Client-ID eingeben.', 422);
        }
        if (strlen($clientSecret) < 10 || strlen($clientSecret) > 255) {
            throw new AppException('VALIDATION_ERROR', 'Bitte das zugehörige Google OAuth-Client-Secret eingeben.', 422);
        }
        $now = gmdate('c');
        $this->repository->saveConfiguration([
            'client_id_encrypted' => $this->cipher->encrypt($clientId),
            'client_secret_encrypted' => $this->cipher->encrypt($clientSecret),
            'created_at' => $now, 'updated_at' => $now,
        ]);
    }

    /** @return array{authorizationUrl: string} */
    public function beginAuthorization(string $callbackUrl): array
    {
        $connection = $this->requireConfigured();
        $state = bin2hex(random_bytes(32));
        $this->repository->storeState(hash('sha256', $state), gmdate('c', time() + 600));
        $query = [
            'client_id' => $this->cipher->decrypt((string) $connection['client_id_encrypted']),
            'redirect_uri' => $callbackUrl,
            'response_type' => 'code',
            'scope' => implode(' ', self::SCOPES),
            'access_type' => 'offline',
            'include_granted_scopes' => 'true',
            'prompt' => 'consent',
            'state' => $state,
        ];
        return ['authorizationUrl' => self::AUTH_URL . '?' . http_build_query($query, '', '&', PHP_QUERY_RFC3986)];
    }

    public function completeAuthorization(array $query, string $callbackUrl): string
    {
        $connection = $this->requireConfigured();
        $state = (string) ($query['state'] ?? '');
        $expected = (string) ($connection['oauth_state_hash'] ?? '');
        $expiresAt = strtotime((string) ($connection['oauth_state_expires_at'] ?? '')) ?: 0;
        if ($state === '' || $expected === '' || $expiresAt < time() || !hash_equals($expected, hash('sha256', $state))) {
            throw new AppException('GOOGLE_OAUTH_STATE_INVALID', 'Die Google-Anmeldung ist abgelaufen. Bitte im Adminbereich neu starten.', 400);
        }
        if (isset($query['error'])) {
            throw new AppException('GOOGLE_OAUTH_DENIED', 'Die Google-Anmeldung wurde abgebrochen.', 400);
        }
        $code = (string) ($query['code'] ?? '');
        if ($code === '' || strlen($code) > 2_048) {
            throw new AppException('GOOGLE_OAUTH_CODE_INVALID', 'Google hat keinen gültigen Anmeldungscode geliefert.', 400);
        }
        $clientId = $this->cipher->decrypt((string) $connection['client_id_encrypted']);
        $clientSecret = $this->cipher->decrypt((string) $connection['client_secret_encrypted']);
        $tokens = $this->client->token([
            'client_id' => $clientId, 'client_secret' => $clientSecret, 'code' => $code,
            'grant_type' => 'authorization_code', 'redirect_uri' => $callbackUrl,
        ]);
        $accessToken = (string) ($tokens['access_token'] ?? '');
        $refreshToken = (string) ($tokens['refresh_token'] ?? '');
        if ($accessToken === '' || $refreshToken === '') {
            throw new AppException('GOOGLE_OAUTH_INCOMPLETE', 'Google hat keinen dauerhaften Kalenderzugriff erteilt.', 400);
        }
        $this->repository->storeTokens([
            'access_token_encrypted' => $this->cipher->encrypt($accessToken),
            'refresh_token_encrypted' => $this->cipher->encrypt($refreshToken),
            'token_expires_at' => gmdate('c', time() + max(60, (int) ($tokens['expires_in'] ?? 3600))),
            'granted_scopes' => (string) ($tokens['scope'] ?? implode(' ', self::SCOPES)),
        ], 'Google-Konto');
        return $accessToken;
    }

    public function accessToken(): string
    {
        $connection = $this->requireConnected();
        $expiresAt = strtotime((string) ($connection['token_expires_at'] ?? '')) ?: 0;
        if ($expiresAt > time() + 60 && is_string($connection['access_token_encrypted']) && $connection['access_token_encrypted'] !== '') {
            return $this->cipher->decrypt($connection['access_token_encrypted']);
        }
        $tokens = $this->client->token([
            'client_id' => $this->cipher->decrypt((string) $connection['client_id_encrypted']),
            'client_secret' => $this->cipher->decrypt((string) $connection['client_secret_encrypted']),
            'refresh_token' => $this->cipher->decrypt((string) $connection['refresh_token_encrypted']),
            'grant_type' => 'refresh_token',
        ]);
        $accessToken = (string) ($tokens['access_token'] ?? '');
        if ($accessToken === '') { throw new AppException('GOOGLE_AUTH_EXPIRED', 'Google verlangt eine erneute Anmeldung.', 401); }
        $expiresAt = gmdate('c', time() + max(60, (int) ($tokens['expires_in'] ?? 3600)));
        $this->repository->updateAccessToken($this->cipher->encrypt($accessToken), $expiresAt);
        return $accessToken;
    }

    public function disconnect(): void
    {
        $connection = $this->repository->connection();
        if ($connection !== null && is_string($connection['refresh_token_encrypted']) && $connection['refresh_token_encrypted'] !== '') {
            try { $this->client->revoke($this->cipher->decrypt($connection['refresh_token_encrypted'])); }
            catch (AppException) { /* Local disconnect must still succeed when Google is unavailable. */ }
        }
        $this->repository->clearConnection();
    }

    public function setAccountLabel(string $label): void { $this->repository->updateAccountLabel($label); }

    /** @return array<string, mixed> */
    private function requireConfigured(): array
    {
        $connection = $this->repository->connection();
        if ($connection === null) { throw new AppException('GOOGLE_NOT_CONFIGURED', 'Google OAuth ist noch nicht eingerichtet.', 409); }
        return $connection;
    }

    /** @return array<string, mixed> */
    private function requireConnected(): array
    {
        $connection = $this->requireConfigured();
        if (!is_string($connection['refresh_token_encrypted']) || $connection['refresh_token_encrypted'] === '') {
            throw new AppException('GOOGLE_NOT_CONNECTED', 'Bitte das Google-Konto zuerst im Adminbereich verbinden.', 409);
        }
        return $connection;
    }

    private function clientIdHint(string $clientId): string
    {
        return strlen($clientId) <= 18 ? $clientId : substr($clientId, 0, 10) . '…' . substr($clientId, -14);
    }
}
