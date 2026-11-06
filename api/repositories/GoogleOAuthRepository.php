<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class GoogleOAuthRepository
{
    public function __construct(private PDO $database) {}

    /** @return array<string, mixed>|null */
    public function connection(): ?array
    {
        $row = $this->database->query('SELECT * FROM google_oauth_connections WHERE id = 1 LIMIT 1')->fetch();
        return $row === false ? null : $row;
    }

    /** @param array<string, mixed> $data */
    public function saveConfiguration(array $data): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO google_oauth_connections (id, client_id_encrypted, client_secret_encrypted, created_at, updated_at)
             VALUES (1, :client_id_encrypted, :client_secret_encrypted, :created_at, :updated_at)
             ON CONFLICT(id) DO UPDATE SET client_id_encrypted = excluded.client_id_encrypted,
                client_secret_encrypted = excluded.client_secret_encrypted, access_token_encrypted = NULL,
                refresh_token_encrypted = NULL, token_expires_at = NULL, granted_scopes = NULL,
                account_label = NULL, oauth_state_hash = NULL, oauth_state_expires_at = NULL,
                updated_at = excluded.updated_at'
        );
        $statement->execute($data);
    }

    public function storeState(string $hash, string $expiresAt): void
    {
        $statement = $this->database->prepare('UPDATE google_oauth_connections SET oauth_state_hash = :hash, oauth_state_expires_at = :expires_at, updated_at = :updated_at WHERE id = 1');
        $statement->execute(['hash' => $hash, 'expires_at' => $expiresAt, 'updated_at' => gmdate('c')]);
    }

    /** @param array<string, mixed> $tokens */
    public function storeTokens(array $tokens, string $accountLabel): void
    {
        $statement = $this->database->prepare(
            'UPDATE google_oauth_connections SET access_token_encrypted = :access_token_encrypted,
             refresh_token_encrypted = :refresh_token_encrypted, token_expires_at = :token_expires_at,
             granted_scopes = :granted_scopes, account_label = :account_label,
             oauth_state_hash = NULL, oauth_state_expires_at = NULL, updated_at = :updated_at WHERE id = 1'
        );
        $statement->execute($tokens + ['account_label' => $accountLabel, 'updated_at' => gmdate('c')]);
    }

    public function updateAccessToken(string $encryptedToken, string $expiresAt): void
    {
        $statement = $this->database->prepare('UPDATE google_oauth_connections SET access_token_encrypted = :token, token_expires_at = :expires_at, updated_at = :updated_at WHERE id = 1');
        $statement->execute(['token' => $encryptedToken, 'expires_at' => $expiresAt, 'updated_at' => gmdate('c')]);
    }

    public function updateAccountLabel(string $label): void
    {
        $statement = $this->database->prepare('UPDATE google_oauth_connections SET account_label = :label, updated_at = :updated_at WHERE id = 1');
        $statement->execute(['label' => $label, 'updated_at' => gmdate('c')]);
    }

    public function clearConnection(): void
    {
        $statement = $this->database->prepare('UPDATE google_oauth_connections SET access_token_encrypted = NULL, refresh_token_encrypted = NULL, token_expires_at = NULL, granted_scopes = NULL, account_label = NULL, oauth_state_hash = NULL, oauth_state_expires_at = NULL, updated_at = :updated_at WHERE id = 1');
        $statement->execute(['updated_at' => gmdate('c')]);
    }
}
