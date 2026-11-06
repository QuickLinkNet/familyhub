<?php
declare(strict_types=1);

use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\TaskRepository;
use FamilyCompass\Services\TaskService;

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
$database->exec(<<<'SQL'
CREATE TABLE households (id INTEGER PRIMARY KEY, timezone TEXT NOT NULL);
INSERT INTO households (timezone) VALUES ('Europe/Berlin');
CREATE TABLE family_members (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active INTEGER NOT NULL,
    avatar_url TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL
);
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NULL,
    assigned_member_uuid TEXT NULL,
    due_date TEXT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    requires_verification INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT NULL,
    routine_period TEXT NULL,
    repeat_days TEXT NULL,
    series_uuid TEXT NULL
);
ALTER TABLE tasks ADD COLUMN reward_points INTEGER NOT NULL DEFAULT 0;
CREATE TABLE rewards (id INTEGER PRIMARY KEY, uuid TEXT NOT NULL UNIQUE, title TEXT NOT NULL, description TEXT NULL, cost_points INTEGER NOT NULL, icon TEXT NOT NULL, color TEXT NOT NULL, is_active INTEGER NOT NULL, created_by_member_uuid TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT NULL);
CREATE TABLE reward_ledger (id INTEGER PRIMARY KEY, uuid TEXT NOT NULL UNIQUE, member_uuid TEXT NOT NULL, task_uuid TEXT NULL UNIQUE, reward_uuid TEXT NULL, entry_type TEXT NOT NULL, points_delta INTEGER NOT NULL, reason TEXT NOT NULL, created_by_member_uuid TEXT NOT NULL, created_at TEXT NOT NULL);
SQL);

$now = gmdate('c');
$memberId = '11111111-1111-4111-8111-111111111111';
$insertMember = $database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NULL, ?, ?)');
$insertMember->execute([$memberId, 'Testkind', '#345b48', 'CHILD', $now, $now]);

$tasks = new TaskRepository($database);
$service = new TaskService($tasks, new FamilyMemberRepository($database));
$today = new DateTimeImmutable('today', new DateTimeZone('Europe/Berlin'));
$created = $service->create([
    'title' => 'Zähne putzen',
    'assignedMemberId' => $memberId,
    'dueDate' => $today->format('Y-m-d'),
    'priority' => 'MEDIUM',
    'requiresVerification' => true,
    'rewardPoints' => 3,
    'routinePeriod' => 'MORNING',
    'repeatDays' => [1, 2, 3, 4, 5, 6, 7],
]);

$pending = $service->complete($created['id'], ['id' => $memberId, 'name' => 'Testkind', 'color' => '#345b48', 'role' => 'CHILD']);
if ($pending['status'] !== 'PENDING_VERIFICATION' || count($service->list()) !== 1) {
    fwrite(STDERR, "Routine completion smoke test failed.\n");
    exit(1);
}

$verified = $service->verify($created['id'], ['id' => $memberId, 'name' => 'Testkind', 'color' => '#345b48', 'role' => 'CHILD']);
$all = $service->list();
$next = array_values(array_filter($all, static fn (array $task): bool => $task['status'] === 'OPEN'))[0] ?? null;
$expectedDate = $today->modify('+1 day')->format('Y-m-d');
$points = (int) $database->query('SELECT COALESCE(SUM(points_delta), 0) FROM reward_ledger')->fetchColumn();
if ($verified['status'] !== 'COMPLETED' || count($all) !== 2 || $next === null || $next['dueDate'] !== $expectedDate || $next['seriesId'] !== $created['seriesId'] || $next['rewardPoints'] !== 3 || $points !== 3) {
    fwrite(STDERR, "Routine scheduling smoke test failed.\n");
    exit(1);
}

echo "Task routine smoke test passed.\n";
