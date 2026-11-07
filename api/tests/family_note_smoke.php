<?php
declare(strict_types=1);

use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\FamilyNoteRepository;
use FamilyCompass\Services\FamilyNoteService;

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
$parentId = '11111111-1111-4111-8111-111111111111';
$childId = '22222222-2222-4222-8222-222222222222';
$otherChildId = '33333333-3333-4333-8333-333333333333';
$member = $database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)');
$member->execute([$parentId, 'Testelternteil', '#345B48', 'PARENT', $now, $now]);
$member->execute([$childId, 'Testkind', '#D6855F', 'CHILD', $now, $now]);
$member->execute([$otherChildId, 'Anderes Kind', '#5B7DB1', 'CHILD', $now, $now]);

$repository = new FamilyNoteRepository($database);
$service = new FamilyNoteService($repository);
$child = ['id' => $childId, 'role' => 'CHILD'];
$parent = ['id' => $parentId, 'role' => 'PARENT'];
$otherChild = ['id' => $otherChildId, 'role' => 'CHILD'];
$created = $service->create(['title' => 'Turnbeutel', 'body' => 'Bitte morgen mitnehmen.', 'icon' => '🏫', 'color' => '#5B7DB1', 'isImportant' => true], $child);
$noteId = $created[0]['id'] ?? null;
if ($noteId === null || !$created[0]['isImportant'] || $created[0]['createdBy']['id'] !== $childId) {
    fwrite(STDERR, "Family note creation smoke test failed.\n"); exit(1);
}
$updated = $service->update((string) $noteId, ['title' => 'Turnbeutel und Trinkflasche'], $parent);
if ($updated[0]['title'] !== 'Turnbeutel und Trinkflasche') {
    fwrite(STDERR, "Family note update smoke test failed.\n"); exit(1);
}
try {
    $service->delete((string) $noteId, $otherChild);
    fwrite(STDERR, "Family note permissions smoke test failed.\n"); exit(1);
} catch (AppException $error) {
    if ($error->errorCode() !== 'FORBIDDEN') { throw $error; }
}
$service->delete((string) $noteId, $child);
if ($service->board() !== []) { fwrite(STDERR, "Family note deletion smoke test failed.\n"); exit(1); }
echo "Family note smoke test passed.\n";
