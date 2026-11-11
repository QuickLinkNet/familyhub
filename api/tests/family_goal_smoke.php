<?php
declare(strict_types=1);

use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\FamilyGoalRepository;
use FamilyCompass\Services\FamilyGoalService;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\';
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
$parentId = '11111111-1111-4111-8111-111111111111';
$childId = '22222222-2222-4222-8222-222222222222';
$member = $database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)');
$member->execute([$parentId, 'Testelternteil', '#345B48', 'PARENT', $now, $now]);
$member->execute([$childId, 'Zielkind', '#D6855F', 'CHILD', $now, $now]);

$service = new FamilyGoalService(new FamilyGoalRepository($database));
$parent = ['id' => $parentId]; $child = ['id' => $childId];
$board = $service->create(['title' => 'Drei Ausflüge', 'description' => 'Gemeinsam raus', 'icon' => '🚲', 'color' => '#5B7DB1', 'targetValue' => 3, 'dueDate' => '2026-12-31'], $parent);
if (count($board['activeGoals']) !== 1 || $board['activeGoals'][0]['currentValue'] !== 0) { fwrite(STDERR, "Family goal creation smoke test failed.\n"); exit(1); }
$goalId = $board['activeGoals'][0]['id'];
$board = $service->contribute($goalId, ['amount' => 1], $child);
if ($board['activeGoals'][0]['currentValue'] !== 1 || $board['activity'][0]['member']['id'] !== $childId) { fwrite(STDERR, "Family goal contribution smoke test failed.\n"); exit(1); }
try { $service->update($goalId, ['title' => 'Zu kleines Ziel', 'targetValue' => 0]); fwrite(STDERR, "Family goal validation smoke test failed.\n"); exit(1); }
catch (AppException $error) { if ($error->errorCode() !== 'VALIDATION_ERROR') { throw $error; } }
$board = $service->contribute($goalId, ['amount' => 10, 'note' => 'Gemeinsam geschafft'], $parent);
if ($board['activeGoals'] !== [] || count($board['completedGoals']) !== 1 || $board['completedGoals'][0]['currentValue'] !== 3 || $board['activity'][0]['amount'] !== 2) { fwrite(STDERR, "Family goal completion smoke test failed.\n"); exit(1); }
$service->delete($goalId);
if ($service->board()['completedGoals'] !== []) { fwrite(STDERR, "Family goal deletion smoke test failed.\n"); exit(1); }

echo "Family goal smoke test passed.\n";
