<?php
declare(strict_types=1);

use FamilyCompass\Config\Config;
use FamilyCompass\Core\Bootstrap;
use FamilyCompass\Core\Logger;
use FamilyCompass\Core\SecretCipher;
use FamilyCompass\Repositories\GoogleOAuthRepository;
use FamilyCompass\Services\GoogleApiClient;
use FamilyCompass\Services\GoogleOAuthService;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\';
    if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix)));
    $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) { require $path; }
});

$root = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'familyhub-oauth-' . bin2hex(random_bytes(6));
$migrationTarget = $root . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'migrations';
if (!mkdir($migrationTarget, 0775, true) && !is_dir($migrationTarget)) { throw new RuntimeException('Temp directory unavailable.'); }
foreach (glob($apiPath . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'migrations' . DIRECTORY_SEPARATOR . '*.sql') ?: [] as $migration) {
    copy($migration, $migrationTarget . DIRECTORY_SEPARATOR . basename($migration));
}

try {
    $config = new Config($root);
    $logger = new Logger($config);
    $bootstrap = new Bootstrap($config, $logger);
    $bootstrap->run();
    $database = $bootstrap->database();
    $cipher = new SecretCipher($config);
    if ($cipher->decrypt($cipher->encrypt('familien-geheimnis')) !== 'familien-geheimnis') { throw new RuntimeException('Cipher roundtrip failed.'); }
    if (!hash_equals($cipher->fingerprint('calendar-id'), $cipher->fingerprint('calendar-id'))) { throw new RuntimeException('Fingerprint is unstable.'); }

    $repository = new GoogleOAuthRepository($database);
    $service = new GoogleOAuthService($repository, $cipher, new GoogleApiClient());
    $clientId = str_repeat('1', 40) . '.apps.googleusercontent.com';
    $service->configure(['clientId' => $clientId, 'clientSecret' => 'test-secret-not-for-production']);
    $status = $service->status('https://example.org/familyhub/api/v1/google-calendar/oauth/callback');
    if (!$status['configured'] || $status['connected'] || str_contains((string) $status['clientIdHint'], 'test-secret')) { throw new RuntimeException('OAuth status failed.'); }

    $authorization = $service->beginAuthorization((string) $status['callbackUrl']);
    $query = [];
    parse_str((string) parse_url($authorization['authorizationUrl'], PHP_URL_QUERY), $query);
    $stored = $repository->connection();
    if (($query['access_type'] ?? '') !== 'offline' || ($query['redirect_uri'] ?? '') !== $status['callbackUrl']) { throw new RuntimeException('Authorization URL failed.'); }
    if (($stored['oauth_state_hash'] ?? '') === ($query['state'] ?? '') || !hash_equals((string) $stored['oauth_state_hash'], hash('sha256', (string) $query['state']))) { throw new RuntimeException('OAuth state was not hashed.'); }

    $tables = ['google_oauth_connections', 'google_calendar_sources', 'google_calendar_events'];
    foreach ($tables as $table) {
        $statement = $database->prepare("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = :name");
        $statement->execute(['name' => $table]);
        if ((int) $statement->fetchColumn() !== 1) { throw new RuntimeException('Missing table: ' . $table); }
    }
    echo "Google OAuth smoke test passed.\n";
} finally {
    $delete = static function (string $path) use (&$delete): void {
        if (!is_dir($path)) { @unlink($path); return; }
        foreach (scandir($path) ?: [] as $entry) { if ($entry !== '.' && $entry !== '..') { $delete($path . DIRECTORY_SEPARATOR . $entry); } }
        @rmdir($path);
    };
    $delete($root);
}
