<?php
declare(strict_types=1);

use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\SchoolRepository;
use FamilyCompass\Services\SchoolService;

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
$files = glob($apiPath . '/database/migrations/*.sql') ?: []; sort($files, SORT_NATURAL);
foreach ($files as $file) { $database->exec((string) file_get_contents($file)); }

$now = gmdate('c');
$parentId = '11111111-1111-4111-8111-111111111111'; $childId = '22222222-2222-4222-8222-222222222222'; $otherId = '33333333-3333-4333-8333-333333333333';
$member = $database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)');
$member->execute([$parentId, 'Testelternteil', '#345B48', 'PARENT', $now, $now]);
$member->execute([$childId, 'Schulkind', '#D6855F', 'CHILD', $now, $now]);
$member->execute([$otherId, 'Anderes Kind', '#5B7DB1', 'CHILD', $now, $now]);

$service = new SchoolService(new SchoolRepository($database), new FamilyMemberRepository($database));
$parent = ['id' => $parentId, 'role' => 'PARENT']; $child = ['id' => $childId, 'role' => 'CHILD']; $other = ['id' => $otherId, 'role' => 'CHILD'];
$service->createLesson(['memberId' => $childId, 'subject' => 'Mathematik', 'weekday' => 1, 'startsAt' => '08:00', 'endsAt' => '08:45', 'room' => 'A12', 'color' => '#5B7DB1'], $parent);
$board = $service->board('2026-11-01', '2026-12-31');
if (count($board['lessons']) !== 1 || $board['lessons'][0]['subject'] !== 'Mathematik') { fwrite(STDERR, "School lesson smoke test failed.\n"); exit(1); }
try { $service->createLesson(['memberId' => $childId, 'subject' => 'Deutsch', 'weekday' => 2, 'startsAt' => '09:00', 'endsAt' => '09:45'], $child); fwrite(STDERR, "School lesson permission smoke test failed.\n"); exit(1); } catch (AppException $error) { if ($error->errorCode() !== 'FORBIDDEN') { throw $error; } }
$service->createItem(['memberId' => $childId, 'itemType' => 'HOMEWORK', 'subject' => 'Mathematik', 'title' => 'Seite 42', 'dueDate' => '2026-11-10'], $child);
$board = $service->board('2026-11-01', '2026-12-31'); $itemId = $board['items'][0]['id'] ?? '';
try { $service->toggleItem($itemId, $other); fwrite(STDERR, "School item permission smoke test failed.\n"); exit(1); } catch (AppException $error) { if ($error->errorCode() !== 'FORBIDDEN') { throw $error; } }
$board = $service->toggleItem($itemId, $child);
if (($board['items'][0]['completedAt'] ?? null) === null) { fwrite(STDERR, "School item completion smoke test failed.\n"); exit(1); }
$service->updateItem($itemId, ['title' => 'Seite 42 und 43'], $parent);
$service->deleteItem($itemId, $parent);
if ($service->board('2026-11-01', '2026-12-31')['items'] !== []) { fwrite(STDERR, "School item deletion smoke test failed.\n"); exit(1); }
echo "School smoke test passed.\n";
