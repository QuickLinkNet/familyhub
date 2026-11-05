<?php
declare(strict_types=1);

use FamilyCompass\Services\IcalParser;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\';
    if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix)));
    $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) { require $path; }
});

$calendar = <<<'ICS'
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:weekly-family@example.com
DTSTART;TZID=Europe/Berlin:20261102T080000
DTEND;TZID=Europe/Berlin:20261102T090000
RRULE:FREQ=WEEKLY;COUNT=3;BYDAY=MO
EXDATE;TZID=Europe/Berlin:20261109T080000
SUMMARY:Schule\, Sport & Familie
LOCATION:Turnhalle
END:VEVENT
BEGIN:VEVENT
UID:all-day@example.com
DTSTART;VALUE=DATE:20261105
DTEND;VALUE=DATE:20261106
SUMMARY:Familientag
END:VEVENT
END:VCALENDAR
ICS;

$events = (new IcalParser())->parse(
    $calendar,
    new DateTimeImmutable('2026-11-01T00:00:00+01:00'),
    new DateTimeImmutable('2026-12-01T00:00:00+01:00'),
    'Europe/Berlin'
);

if (count($events) !== 3 || $events[0]['title'] !== 'Schule, Sport & Familie' || $events[1]['all_day'] !== 1) {
    fwrite(STDERR, "iCal parser smoke test failed.\n");
    exit(1);
}

echo "iCal parser smoke test passed.\n";
