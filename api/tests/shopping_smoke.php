<?php
declare(strict_types=1);

use FamilyCompass\Repositories\ShoppingRepository;
use FamilyCompass\Services\ShoppingService;

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
$memberId = '11111111-1111-4111-8111-111111111111';
$member = $database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)');
$member->execute([$memberId, 'Testperson', '#345B48', 'PARENT', $now, $now]);
$actor = ['id' => $memberId];
$service = new ShoppingService(new ShoppingRepository($database));

$lists = $service->createList(['name' => 'Wocheneinkauf', 'icon' => '🛒', 'color' => '#345B48'], $actor);
$listId = $lists[0]['id'] ?? '';
$lists = $service->createItem($listId, ['name' => 'Äpfel', 'quantity' => '6 Stück', 'category' => 'PRODUCE', 'note' => 'regional', 'isUrgent' => true], $actor);
$itemId = $lists[0]['items'][0]['id'] ?? '';
$lists = $service->updateItem($itemId, ['name' => 'Äpfel', 'quantity' => '1 kg', 'category' => 'PRODUCE', 'note' => 'regional', 'isUrgent' => false]);
$lists = $service->toggle($itemId, $actor);
$item = $lists[0]['items'][0] ?? null;
if ($listId === '' || $itemId === '' || $item === null || !$item['isChecked'] || $item['quantity'] !== '1 kg' || $item['checkedBy']['id'] !== $memberId) {
    fwrite(STDERR, "Shopping lifecycle smoke test failed.\n"); exit(1);
}
$lists = $service->clearChecked($listId);
if (count($lists[0]['items']) !== 0) { fwrite(STDERR, "Shopping clear smoke test failed.\n"); exit(1); }
$service->deleteList($listId);
if ($service->list() !== []) { fwrite(STDERR, "Shopping list deletion smoke test failed.\n"); exit(1); }
echo "Shopping smoke test passed.\n";
