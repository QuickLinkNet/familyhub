<?php
declare(strict_types=1);

use FamilyHub\Models\CalendarEvent;
use FamilyHub\Models\FamilyMember;
use FamilyHub\Services\BirthdayEventFactory;
use FamilyHub\Services\CalendarRecurrenceExpander;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyHub\\'; if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php'; if (is_file($path)) { require $path; }
});

$event = new CalendarEvent(
    'event-1', 'calendar-1', 'Familie', '#345B48', 'Monatsplanung', null, null,
    '2026-01-31T09:00:00Z', '2026-01-31T10:00:00Z', false, false, 'MONTHLY', 1, '2026-04-30',
    'member-1', 'Alex', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'
);
$occurrences = (new CalendarRecurrenceExpander())->expand($event, new DateTimeImmutable('2026-01-01T00:00:00Z'), new DateTimeImmutable('2026-05-01T00:00:00Z'));
$starts = array_column($occurrences, 'startsAt');
if ($starts !== ['2026-01-31T09:00:00Z', '2026-03-31T09:00:00Z'] || $occurrences[1]['seriesId'] !== 'event-1') {
    fwrite(STDERR, "Calendar recurrence expansion failed.\n"); exit(1);
}

$weekendEvent = new CalendarEvent(
    'event-2', 'calendar-1', 'Familie', '#345B48', 'Familienwochenende', null, null,
    '2026-01-03T09:00:00Z', '2026-01-03T10:00:00Z', false, false, 'WEEKLY', 2, '2026-01-31',
    'member-1', 'Alex', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', [], [6, 7]
);
$weekendOccurrences = (new CalendarRecurrenceExpander())->expand($weekendEvent, new DateTimeImmutable('2026-01-01T00:00:00Z'), new DateTimeImmutable('2026-02-01T00:00:00Z'));
if (array_column($weekendOccurrences, 'startsAt') !== ['2026-01-03T09:00:00Z', '2026-01-04T09:00:00Z', '2026-01-17T09:00:00Z', '2026-01-18T09:00:00Z', '2026-01-31T09:00:00Z']) {
    fwrite(STDERR, "Multi-day weekly recurrence expansion failed.\n"); exit(1);
}
if (($weekendOccurrences[0]['recurrence']['weekdays'] ?? null) !== [6, 7]) {
    fwrite(STDERR, "Calendar recurrence weekdays serialization failed.\n"); exit(1);
}

$member = new FamilyMember('member-1', 'Sophie', '#D6855F', 'PARENT', true, null, '1990-02-28', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
$birthdays = (new BirthdayEventFactory())->between([$member], new DateTimeImmutable('2026-02-01T00:00:00Z'), new DateTimeImmutable('2026-03-01T00:00:00Z'));
if (count($birthdays) !== 1 || $birthdays[0]['source'] !== 'BIRTHDAY' || $birthdays[0]['title'] !== '🎂 Sophie hat Geburtstag') {
    fwrite(STDERR, "Birthday calendar event generation failed.\n"); exit(1);
}

echo "Calendar experience smoke test passed.\n";
