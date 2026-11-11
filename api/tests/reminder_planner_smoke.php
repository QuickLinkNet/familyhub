<?php
declare(strict_types=1);

use FamilyCompass\Services\ReminderPlanner;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\';
    if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) { require $path; }
});

$planner = new ReminderPlanner();
$now = new DateTimeImmutable('2026-11-11T16:00:00+01:00');
$child = ['id' => 'child-1', 'name' => 'Mia', 'color' => '#5B7DB1', 'role' => 'CHILD'];
$parent = ['id' => 'parent-1', 'name' => 'Alex', 'color' => '#345B48', 'role' => 'PARENT'];
$childRef = ['id' => 'child-1', 'name' => 'Mia', 'color' => '#5B7DB1'];
$otherRef = ['id' => 'child-2', 'name' => 'Noah', 'color' => '#D6855F'];
$tasks = [
    ['id' => 'task-own', 'title' => 'Sporttasche packen', 'assignedMember' => $childRef, 'dueDate' => '2026-11-10', 'status' => 'OPEN'],
    ['id' => 'task-other', 'title' => 'Zimmer aufräumen', 'assignedMember' => $otherRef, 'dueDate' => '2026-11-11', 'status' => 'OPEN'],
    ['id' => 'task-check', 'title' => 'Spülmaschine', 'assignedMember' => $childRef, 'dueDate' => '2026-11-11', 'status' => 'PENDING_VERIFICATION', 'completedAt' => '2026-11-11T15:00:00+01:00'],
];
$school = ['items' => [['id' => 'school-own', 'title' => 'Vokabeltest', 'subject' => 'Englisch', 'itemType' => 'TEST', 'dueDate' => '2026-11-12', 'completedAt' => null, 'member' => $childRef]]];
$routines = ['runs' => [['id' => 'routine-own', 'title' => 'Nachmittagsroutine', 'routinePeriod' => 'AFTERNOON', 'status' => 'OPEN', 'assignedMember' => $childRef, 'progress' => ['completed' => 1, 'total' => 3]]]];
$events = [['id' => 'event-1', 'title' => 'Training', 'startsAt' => '2026-11-11T17:00:00+01:00', 'endsAt' => '2026-11-11T18:00:00+01:00', 'location' => 'Turnhalle']];

$childBoard = $planner->build($child, $events, $tasks, $routines, $school, $now);
$childIds = array_column($childBoard['items'], 'id');
if (!in_array('TASK:task-own', $childIds, true) || in_array('TASK:task-other', $childIds, true) || in_array('VERIFICATION:task-check', $childIds, true)) {
    fwrite(STDERR, "Child reminder visibility smoke test failed.\n"); exit(1);
}
if ($childBoard['items'][0]['urgency'] !== 'CRITICAL' || $childBoard['summary']['critical'] < 1) {
    fwrite(STDERR, "Reminder urgency smoke test failed.\n"); exit(1);
}

$parentBoard = $planner->build($parent, $events, $tasks, $routines, $school, $now);
$parentIds = array_column($parentBoard['items'], 'id');
if (!in_array('TASK:task-other', $parentIds, true) || !in_array('VERIFICATION:task-check', $parentIds, true)) {
    fwrite(STDERR, "Adult reminder overview smoke test failed.\n"); exit(1);
}

echo "Reminder planner smoke test passed.\n";
