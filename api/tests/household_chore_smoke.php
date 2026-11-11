<?php
declare(strict_types=1);

use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\HouseholdChoreRepository;
use FamilyCompass\Services\HouseholdChoreService;

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
$today = new DateTimeImmutable('today');
$parentId = '11111111-1111-4111-8111-111111111111';
$childId = '22222222-2222-4222-8222-222222222222';
$otherId = '33333333-3333-4333-8333-333333333333';
$member = $database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)');
$member->execute([$parentId, 'Testelternteil', '#345B48', 'PARENT', $now, $now]);
$member->execute([$childId, 'Haushaltskind', '#D6855F', 'CHILD', $now, $now]);
$member->execute([$otherId, 'Anderes Kind', '#5B7DB1', 'CHILD', $now, $now]);

$service = new HouseholdChoreService(new HouseholdChoreRepository($database), new FamilyMemberRepository($database));
$parent = ['id' => $parentId, 'role' => 'PARENT'];
$child = ['id' => $childId, 'role' => 'CHILD'];
$other = ['id' => $otherId, 'role' => 'CHILD'];
$input = ['title' => 'Pflanzen gießen', 'description' => 'Auch die Kräuter', 'category' => 'PLANTS', 'assignedMemberId' => $childId, 'recurrence' => 'WEEKLY', 'nextDueDate' => $today->format('Y-m-d')];

$board = $service->create($input, $parent);
if (count($board['chores']) !== 1 || $board['chores'][0]['title'] !== 'Pflanzen gießen') { fwrite(STDERR, "Household chore creation smoke test failed.\n"); exit(1); }
$choreId = $board['chores'][0]['id'];
try { $service->complete($choreId, $other); fwrite(STDERR, "Household chore permission smoke test failed.\n"); exit(1); }
catch (AppException $error) { if ($error->errorCode() !== 'FORBIDDEN') { throw $error; } }
$board = $service->complete($choreId, $child);
if (count($board['completions']) !== 1 || $board['chores'][0]['nextDueDate'] !== $today->modify('+7 days')->format('Y-m-d')) { fwrite(STDERR, "Household chore completion smoke test failed.\n"); exit(1); }
$board = $service->update($choreId, ['title' => 'Alle Pflanzen gießen'], $parent);
if ($board['chores'][0]['title'] !== 'Alle Pflanzen gießen') { fwrite(STDERR, "Household chore update smoke test failed.\n"); exit(1); }
$once = $service->create(['title' => 'Keller aufräumen', 'category' => 'CLEANING', 'assignedMemberId' => $parentId, 'recurrence' => 'ONCE', 'nextDueDate' => $today->format('Y-m-d')], $parent);
$onceId = array_values(array_filter($once['chores'], static fn (array $chore): bool => $chore['title'] === 'Keller aufräumen'))[0]['id'];
$afterOnce = $service->complete($onceId, $parent);
if (count(array_filter($afterOnce['chores'], static fn (array $chore): bool => $chore['id'] === $onceId)) !== 0) { fwrite(STDERR, "One-off household chore smoke test failed.\n"); exit(1); }
$service->delete($choreId, $parent);
if ($service->board()['chores'] !== []) { fwrite(STDERR, "Household chore deletion smoke test failed.\n"); exit(1); }

echo "Household chore smoke test passed.\n";
