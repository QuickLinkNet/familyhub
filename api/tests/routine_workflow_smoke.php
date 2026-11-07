<?php
declare(strict_types=1);

use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\RoutineRepository;
use FamilyCompass\Services\RoutineService;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\'; if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php'; if (is_file($path)) { require $path; }
});

$database = new PDO('sqlite::memory:');
$database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$database->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$files = glob($apiPath . '/database/migrations/*.sql') ?: []; sort($files, SORT_NATURAL);
foreach ($files as $file) { $database->exec((string) file_get_contents($file)); }

$now = gmdate('c');
$householdId = '00000000-0000-4000-8000-000000000001';
$memberId = '11111111-1111-4111-8111-111111111111';
$database->prepare('INSERT INTO households (id, uuid, name, locale, timezone, setup_completed_at, created_at, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?)')->execute([$householdId, 'Testfamilie', 'de-DE', 'Europe/Berlin', $now, $now, $now]);
$database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)')->execute([$memberId, 'Testkind', '#345B48', 'CHILD', $now, $now]);

$service = new RoutineService(new RoutineRepository($database), new FamilyMemberRepository($database));
$weekday = (int) (new DateTimeImmutable('today', new DateTimeZone('Europe/Berlin')))->format('N');
$created = $service->create([
    'title' => 'Startklar für die Schule',
    'description' => 'Alles in Ruhe erledigen',
    'assignedMemberId' => $memberId,
    'routinePeriod' => 'MORNING',
    'repeatDays' => [$weekday],
    'steps' => ['Zähne putzen', 'Schulranzen prüfen'],
]);
$template = $created['templates'][0] ?? null;
$run = $created['runs'][0] ?? null;
if ($template === null || $run === null || $run['progress'] !== ['completed' => 0, 'total' => 2]) {
    fwrite(STDERR, "Routine workflow creation failed.\n"); exit(1);
}

$actor = ['id' => $memberId, 'role' => 'CHILD'];
$half = $service->completeStep($run['id'], $run['steps'][0]['id'], $actor);
$done = $service->completeStep($run['id'], $run['steps'][1]['id'], $actor);
if ($half['progress'] !== ['completed' => 1, 'total' => 2] || $half['status'] !== 'OPEN' || $done['progress'] !== ['completed' => 2, 'total' => 2] || $done['status'] !== 'COMPLETED') {
    fwrite(STDERR, "Routine workflow progress failed.\n"); exit(1);
}

$updated = $service->update($template['id'], [
    'title' => 'Startklar', 'description' => null, 'assignedMemberId' => $memberId,
    'routinePeriod' => 'MORNING', 'repeatDays' => [$weekday],
    'steps' => ['Waschen', 'Zähne putzen', 'Schulranzen prüfen'], 'isActive' => false,
]);
$updatedTemplate = $updated['templates'][0] ?? null;
if ($updatedTemplate === null || $updatedTemplate['title'] !== 'Startklar' || $updatedTemplate['isActive'] !== false || count($updatedTemplate['steps']) !== 3) {
    fwrite(STDERR, "Routine workflow series update failed.\n"); exit(1);
}

$service->delete($template['id']);
if ($service->overview()['templates'] !== []) { fwrite(STDERR, "Routine workflow deletion failed.\n"); exit(1); }
echo "Routine workflow smoke test passed.\n";
