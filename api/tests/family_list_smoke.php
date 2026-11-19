<?php
declare(strict_types=1);

use FamilyHub\Repositories\FamilyListRepository;
use FamilyHub\Repositories\FamilyMemberRepository;
use FamilyHub\Services\FamilyListService;

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
$parentId = '11111111-1111-4111-8111-111111111111';
$otherParentId = '22222222-2222-4222-8222-222222222222';
$childId = '33333333-3333-4333-8333-333333333333';
$member = $database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)');
$member->execute([$parentId, 'Testelternteil', '#345B48', 'PARENT', $now, $now]);
$member->execute([$otherParentId, 'Anderes Elternteil', '#D6855F', 'PARENT', $now, $now]);
$member->execute([$childId, 'Testkind', '#6C8AB8', 'CHILD', $now, $now]);

$service = new FamilyListService(new FamilyListRepository($database), new FamilyMemberRepository($database));
$parent = ['id' => $parentId, 'role' => 'PARENT'];
$otherParent = ['id' => $otherParentId, 'role' => 'PARENT'];
$child = ['id' => $childId, 'role' => 'CHILD'];
$private = $service->createList(['name' => 'Geschenkideen', 'icon' => '🎁', 'color' => '#9A6C8D', 'visibility' => 'PRIVATE'], $parent);
$privateId = $private[0]['id'] ?? null;
if ($privateId === null || $service->all($otherParent) !== [] || $service->all($child) !== []) {
    fwrite(STDERR, "Private list visibility failed.\n"); exit(1);
}
$family = $service->createList(['name' => 'Urlaub', 'description' => 'Gemeinsam packen', 'icon' => '🧳', 'color' => '#6C8AB8', 'visibility' => 'FAMILY'], $parent);
$familyList = array_values(array_filter($family, static fn (array $list): bool => $list['name'] === 'Urlaub'))[0] ?? null;
if ($familyList === null || count($service->all($child)) !== 1) { fwrite(STDERR, "Shared list visibility failed.\n"); exit(1); }
$familyId = $familyList['id'];
$withItem = $service->createItem($familyId, ['title' => 'Reisepässe', 'note' => 'Gültigkeit prüfen', 'assignedToMemberId' => $otherParentId], $child);
$updatedFamily = array_values(array_filter($withItem, static fn (array $list): bool => $list['id'] === $familyId))[0];
$item = $updatedFamily['items'][0] ?? null;
if ($item === null || $item['assignedTo']['id'] !== $otherParentId) { fwrite(STDERR, "List item creation failed.\n"); exit(1); }
$completed = $service->toggleItem($item['id'], $otherParent);
$completedFamily = array_values(array_filter($completed, static fn (array $list): bool => $list['id'] === $familyId))[0];
if (!$completedFamily['items'][0]['isCompleted'] || $completedFamily['items'][0]['completedBy']['id'] !== $otherParentId) {
    fwrite(STDERR, "List item completion failed.\n"); exit(1);
}
$service->clearCompleted($familyId, $parent);
if (array_values(array_filter($service->all($parent), static fn (array $list): bool => $list['id'] === $familyId))[0]['items'] !== []) {
    fwrite(STDERR, "Clearing completed items failed.\n"); exit(1);
}

echo "Family list smoke test passed.\n";
