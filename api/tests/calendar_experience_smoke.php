<?php
declare(strict_types=1);

use FamilyCompass\Models\CalendarEvent;
use FamilyCompass\Models\FamilyMember;
use FamilyCompass\Services\BirthdayEventFactory;
use FamilyCompass\Services\CalendarRecurrenceExpander;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\'; if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php'; if (is_file($path)) { require $path; }
});

$event = new CalendarEvent(
    'event-1', 'calendar-1', 'Familie', '#345B48', 'Monatsplanung', null, null,
    '2026-01-31T09:00:00Z', '2026-01-31T10:00:00Z', false, 'MONTHLY', 1, '2026-04-30',
    'member-1', 'Alex', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'
);
$occurrences = (new CalendarRecurrenceExpander())->expand($event, new DateTimeImmutable('2026-01-01T00:00:00Z'), new DateTimeImmutable('2026-05-01T00:00:00Z'));
$starts = array_column($occurrences, 'startsAt');
if ($starts !== ['2026-01-31T09:00:00Z', '2026-03-31T09:00:00Z'] || $occurrences[1]['seriesId'] !== 'event-1') {
    fwrite(STDERR, "Calendar recurrence expansion failed.\n"); exit(1);
}

$member = new FamilyMember('member-1', 'Sophie', '#D6855F', 'PARENT', true, null, '1990-02-28', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
$birthdays = (new BirthdayEventFactory())->between([$member], new DateTimeImmutable('2026-02-01T00:00:00Z'), new DateTimeImmutable('2026-03-01T00:00:00Z'));
if (count($birthdays) !== 1 || $birthdays[0]['source'] !== 'BIRTHDAY' || $birthdays[0]['title'] !== '🎂 Sophie hat Geburtstag') {
    fwrite(STDERR, "Birthday calendar event generation failed.\n"); exit(1);
}

echo "Calendar experience smoke test passed.\n";
