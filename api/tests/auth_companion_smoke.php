<?php
declare(strict_types=1);

use FamilyHub\Core\AppException;
use FamilyHub\Core\PublicUrl;
use FamilyHub\Repositories\AuthRepository;
use FamilyHub\Services\AuthService;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyHub\\';
    if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) { require $path; }
});

$database = new PDO('sqlite::memory:');
$database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$database->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$database->exec('PRAGMA foreign_keys = ON');
$files = glob($apiPath . '/database/migrations/*.sql') ?: []; sort($files, SORT_NATURAL);
foreach ($files as $file) { $database->exec((string) file_get_contents($file)); }

$now = gmdate('c');
$adminId = '11111111-1111-4111-8111-111111111111';
$memberId = '22222222-2222-4222-8222-222222222222';
$insert = $database->prepare('INSERT INTO family_members (uuid, name, color, role, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)');
$insert->execute([$adminId, 'Testadmin', '#345B48', 'ADMIN', password_hash('sicheres-passwort', PASSWORD_DEFAULT), $now, $now]);
$insert->execute([$memberId, 'Testprofil', '#D6855F', 'PARENT', password_hash('anderes-passwort', PASSWORD_DEFAULT), $now, $now]);

if (session_status() !== PHP_SESSION_ACTIVE) { session_start(); }
$_SERVER['HTTP_USER_AGENT'] = 'FamilyHub Smoke Phone';
putenv('FAMILYHUB_PUBLIC_URL=https://familyhub.example');
$repository = new AuthRepository($database);
$service = new AuthService($repository, new PublicUrl());
$invitation = $service->createInvitation(['id' => $adminId, 'name' => 'Testadmin', 'color' => '#345B48', 'role' => 'ADMIN'], ['memberId' => $memberId]);
parse_str((string) parse_url($invitation['url'], PHP_URL_QUERY), $query);
$token = (string) ($query['token'] ?? '');
if (strlen($token) !== 43 || $invitation['profile']['id'] !== $memberId) { fwrite(STDERR, "Companion invitation creation failed.\n"); exit(1); }
$preview = $service->invitation($token);
if ($preview['profile']['name'] !== 'Testprofil') { fwrite(STDERR, "Companion invitation preview failed.\n"); exit(1); }
$session = $service->redeemInvitation($token, ['deviceLabel' => 'Test-Handy']);
if (!$session['authenticated'] || $session['user']['id'] !== $memberId || count($service->devices()) !== 1 || !$service->devices()[0]['current']) {
    fwrite(STDERR, "Companion invitation redemption failed.\n"); exit(1);
}
try {
    $service->redeemInvitation($token, ['deviceLabel' => 'Zweites Handy']);
    fwrite(STDERR, "Companion invitation reuse was not rejected.\n"); exit(1);
} catch (AppException $error) {
    if ($error->errorCode() !== 'INVITATION_UNAVAILABLE') { throw $error; }
}
if ((int) $database->query("SELECT COUNT(*) FROM auth_invitations WHERE token_hash = '" . $token . "'")->fetchColumn() !== 0) {
    fwrite(STDERR, "Raw companion token was stored.\n"); exit(1);
}

echo "Auth companion smoke test passed.\n";
