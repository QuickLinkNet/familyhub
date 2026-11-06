<?php
declare(strict_types=1);

use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\RewardRepository;
use FamilyCompass\Services\RewardService;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\';
    if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix)));
    $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) { require $path; }
});

$database = new PDO('sqlite::memory:');
$database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$database->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$files = glob($apiPath . '/database/migrations/*.sql') ?: [];
sort($files, SORT_NATURAL);
foreach ($files as $file) { $database->exec((string) file_get_contents($file)); }

$now = gmdate('c');
$adultId = '11111111-1111-4111-8111-111111111111';
$childId = '22222222-2222-4222-8222-222222222222';
$member = $database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)');
$member->execute([$adultId, 'Testelternteil', '#345B48', 'PARENT', $now, $now]);
$member->execute([$childId, 'Testkind', '#D6855F', 'CHILD', $now, $now]);
$actor = ['id' => $adultId, 'name' => 'Testelternteil', 'color' => '#345B48', 'role' => 'PARENT'];
$service = new RewardService(new RewardRepository($database), new FamilyMemberRepository($database));

$created = $service->create(['title' => 'Eis essen', 'description' => 'Lieblingseis aussuchen', 'costPoints' => 12, 'icon' => '🍦', 'color' => '#D6855F'], $actor);
$rewardId = $created['rewards'][0]['id'] ?? null;
$service->bonus(['memberId' => $childId, 'points' => 15, 'reason' => 'Toll geholfen'], $actor);
$redeemed = $service->redeem((string) $rewardId, ['memberId' => $childId], $actor);
$balance = $redeemed['balances'][0]['member']['id'] === $childId ? $redeemed['balances'][0]['points'] : $redeemed['balances'][1]['points'];
if ($rewardId === null || $balance !== 3 || count($redeemed['activity']) !== 2) {
    fwrite(STDERR, "Reward ledger smoke test failed.\n"); exit(1);
}
try {
    $service->redeem((string) $rewardId, ['memberId' => $childId], $actor);
    fwrite(STDERR, "Insufficient balance smoke test failed.\n"); exit(1);
} catch (AppException $error) {
    if ($error->errorCode() !== 'INSUFFICIENT_POINTS') { throw $error; }
}
echo "Reward smoke test passed.\n";
