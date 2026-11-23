<?php
declare(strict_types=1);

use FamilyHub\Core\AppException;
use FamilyHub\Repositories\ProfilePreferenceRepository;
use FamilyHub\Services\ProfilePreferenceService;

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
$now = gmdate('c'); $memberId = '11111111-1111-4111-8111-111111111111';
$database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)')->execute([$memberId, 'Testperson', '#345B48', 'PARENT', $now, $now]);
$database->prepare('INSERT INTO households (id, uuid, name, locale, timezone, setup_completed_at, created_at, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?)')->execute(['22222222-2222-4222-8222-222222222222', 'Testhaushalt', 'de-DE', 'Europe/Berlin', $now, $now, $now]);

$service = new ProfilePreferenceService(new ProfilePreferenceRepository($database));
$actor = ['id' => $memberId];
$defaults = $service->show($actor);
$saved = $service->update($actor, [
    'dashboardCards' => ['MEALS', 'TODAY', 'TASKS'],
    'wallCards' => ['EVENTS', 'TASKS'],
    'quietHoursEnabled' => true,
    'quietHoursStart' => '22:00',
    'quietHoursEnd' => '07:00',
    'calendarView' => 'FIVE_DAY',
    'calendarMemberIds' => [$memberId],
    'calendarIds' => ['family-calendar', 'birthdays'],
]);
$late = $service->quietHoursActive($memberId, new DateTimeImmutable('2026-11-19 23:00:00', new DateTimeZone('Europe/Berlin')));
$day = $service->quietHoursActive($memberId, new DateTimeImmutable('2026-11-19 12:00:00', new DateTimeZone('Europe/Berlin')));
$timeline = $service->update($actor, ['calendarView' => 'TIMELINE']);
if (!in_array('REMINDERS', $defaults['dashboardCards'], true) || $defaults['calendarView'] !== 'WEEK' || $saved['dashboardCards'] !== ['MEALS', 'TODAY', 'TASKS'] || $saved['calendarView'] !== 'FIVE_DAY' || $timeline['calendarView'] !== 'TIMELINE' || $saved['calendarMemberIds'] !== [$memberId] || $saved['calendarIds'] !== ['family-calendar', 'birthdays'] || !$late || $day) {
    fwrite(STDERR, "Profile preferences smoke test failed.\n"); exit(1);
}
try {
    $service->update($actor, ['dashboardCards' => ['UNKNOWN']]);
    fwrite(STDERR, "Profile preferences validation test failed.\n"); exit(1);
} catch (AppException $exception) {
    if ($exception->errorCode() !== 'VALIDATION_ERROR') { throw $exception; }
}
try {
    $service->update($actor, ['calendarView' => 'BOARD']);
    fwrite(STDERR, "Calendar preference validation test failed.\n"); exit(1);
} catch (AppException $exception) {
    if ($exception->errorCode() !== 'VALIDATION_ERROR') { throw $exception; }
}
echo "Profile preferences smoke test passed.\n";
