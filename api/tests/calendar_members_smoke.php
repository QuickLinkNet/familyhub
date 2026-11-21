<?php
declare(strict_types=1);

use FamilyHub\Repositories\CalendarRepository;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyHub\\'; if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php'; if (is_file($path)) { require $path; }
});

$database = new PDO('sqlite::memory:');
$database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$database->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$files = glob($apiPath . '/database/migrations/*.sql') ?: []; sort($files, SORT_NATURAL);
foreach ($files as $file) { $database->exec((string) file_get_contents($file)); }
$now = gmdate('c');
$members = [
    ['11111111-1111-4111-8111-111111111111', 'Alex', '#345B48'],
    ['22222222-2222-4222-8222-222222222222', 'Sam', '#D6855F'],
    ['33333333-3333-4333-8333-333333333333', 'Kim', '#6C8AB8'],
];
$memberInsert = $database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)');
foreach ($members as [$id, $name, $color]) { $memberInsert->execute([$id, $name, $color, 'PARENT', $now, $now]); }
$householdId = '44444444-4444-4444-8444-444444444444'; $calendarId = '55555555-5555-4555-8555-555555555555';
$database->prepare('INSERT INTO households (id, uuid, name, locale, timezone, setup_completed_at, created_at, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?)')->execute([$householdId, 'Testhaushalt', 'de-DE', 'Europe/Berlin', $now, $now, $now]);
$database->prepare('INSERT INTO calendars (uuid, household_uuid, owner_member_uuid, name, color, calendar_type, is_active, created_at, updated_at) VALUES (?, ?, NULL, ?, ?, ?, 1, ?, ?)')->execute([$calendarId, $householdId, 'Familie', '#345B48', 'SHARED', $now, $now]);

$repository = new CalendarRepository($database); $eventId = '66666666-6666-4666-8666-666666666666';
$data = [
    'uuid' => $eventId, 'calendar_uuid' => $calendarId, 'title' => 'Familienausflug', 'description' => null, 'location' => null,
    'starts_at' => '2026-11-21T09:00:00Z', 'ends_at' => '2026-11-21T12:00:00Z', 'all_day' => 0, 'is_private' => 0,
    'recurrence_frequency' => null, 'recurrence_interval' => 1, 'recurrence_until' => null, 'recurrence_weekdays_json' => '[]',
    'created_by_member_uuid' => $members[0][0], 'created_at' => $now, 'updated_at' => $now,
];
$created = $repository->createEvent($data, [$members[0][0], $members[1][0]]);
$update = $data; unset($update['uuid'], $update['created_by_member_uuid'], $update['created_at']); $update['title'] = 'Gemeinsamer Ausflug';
$updated = $repository->updateEvent($eventId, $update, [$members[2][0], $members[0][0]]);
$between = $repository->eventsBetween('2026-11-21T00:00:00Z', '2026-11-22T00:00:00Z');
if (array_column($created->members, 'name') !== ['Alex', 'Sam'] || array_column($updated->members, 'name') !== ['Kim', 'Alex'] || count($between) !== 1 || array_column($between[0]->members, 'name') !== ['Kim', 'Alex']) {
    fwrite(STDERR, "Calendar member assignment smoke test failed.\n"); exit(1);
}
echo "Calendar member assignment smoke test passed.\n";
