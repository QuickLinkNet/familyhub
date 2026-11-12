<?php
declare(strict_types=1);

use FamilyCompass\Models\CalendarEvent;
use FamilyCompass\Services\CalendarService;
use FamilyCompass\Services\IcalParser;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\'; if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php'; if (is_file($path)) { require $path; }
});

$event = new CalendarEvent(
    'private-1', 'calendar-1', 'Familie', '#345B48', 'Arzttermin', 'Vertraulich', 'Praxis',
    '2026-11-12T09:00:00Z', '2026-11-12T10:00:00Z', false, true, null, 1, null,
    'member-1', 'Alex', '2026-11-01T00:00:00Z', '2026-11-01T00:00:00Z'
);
if ($event->toArray()['isPrivate'] !== true) { fwrite(STDERR, "Local privacy mapping failed.\n"); exit(1); }

$ical = "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:private@example.test\r\nDTSTART:20261112T090000Z\r\nDTEND:20261112T100000Z\r\nSUMMARY:Vertraulich\r\nCLASS:PRIVATE\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
$parsed = (new IcalParser())->parse($ical, new DateTimeImmutable('2026-11-01T00:00:00Z'), new DateTimeImmutable('2026-12-01T00:00:00Z'), 'Europe/Berlin');
if (count($parsed) !== 1 || ($parsed[0]['is_private'] ?? 0) !== 1) { fwrite(STDERR, "iCal privacy mapping failed.\n"); exit(1); }

$service = (new ReflectionClass(CalendarService::class))->newInstanceWithoutConstructor();
$method = new ReflectionMethod(CalendarService::class, 'maskPrivateEvent');
$method->setAccessible(true);
$masked = $method->invoke($service, $event->toArray());
if ($masked['title'] !== 'Privater Termin' || $masked['description'] !== null || $masked['location'] !== null || $masked['editable'] !== false) {
    fwrite(STDERR, "Child privacy masking failed.\n"); exit(1);
}

echo "Calendar privacy smoke test passed.\n";
