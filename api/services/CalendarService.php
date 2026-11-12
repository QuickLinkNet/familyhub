<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use DateTimeZone;
use FamilyCompass\Core\AppException;
use FamilyCompass\Models\Calendar;
use FamilyCompass\Models\CalendarEvent;
use FamilyCompass\Repositories\CalendarRepository;
use FamilyCompass\Repositories\CalendarSourceRepository;
use FamilyCompass\Repositories\FamilyMemberRepository;

final class CalendarService
{
    public function __construct(
        private CalendarRepository $repository,
        private CalendarSourceRepository $sourceRepository,
        private CalendarSourceService $sourceService,
        private GoogleCalendarService $googleService,
        private FamilyMemberRepository $familyRepository,
        private CalendarRecurrenceExpander $recurrenceExpander,
        private BirthdayEventFactory $birthdayFactory
    ) {}

    /** @return list<array<string, mixed>> */
    public function calendars(): array
    {
        return array_merge(
            array_map(static fn (Calendar $calendar): array => $calendar->toArray(), $this->repository->allCalendars()),
            $this->sourceRepository->activeCalendars(),
            $this->googleService->calendars()
        );
    }

    /** @return list<array<string, mixed>> */
    public function events(string $from, string $to, ?array $actor = null): array
    {
        $fromDate = $this->dateTime($from, 'Der Beginn des Zeitraums ist ungültig.');
        $toDate = $this->dateTime($to, 'Das Ende des Zeitraums ist ungültig.');
        if ($toDate <= $fromDate || $toDate->getTimestamp() - $fromDate->getTimestamp() > 370 * 86400) {
            throw new AppException('VALIDATION_ERROR', 'Der Kalenderzeitraum muss positiv und höchstens 370 Tage lang sein.', 422);
        }
        $this->sourceService->synchronizeStale();
        $this->googleService->synchronizeStale();
        $fromUtc = $this->utc($fromDate);
        $toUtc = $this->utc($toDate);
        $localEvents = [];
        foreach ($this->repository->eventsBetween($fromUtc, $toUtc) as $event) {
            array_push($localEvents, ...$this->recurrenceExpander->expand($event, $fromDate, $toDate));
        }
        $events = array_merge(
            $localEvents,
            $this->birthdayFactory->between($this->familyRepository->all(), $fromDate, $toDate),
            $this->sourceRepository->eventsBetween($fromUtc, $toUtc),
            $this->googleService->eventsBetween($fromUtc, $toUtc)
        );
        usort($events, static fn (array $a, array $b): int => [$a['startsAt'], $a['endsAt'], $a['title']] <=> [$b['startsAt'], $b['endsAt'], $b['title']]);
        if (($actor['role'] ?? null) === 'CHILD') {
            $events = array_map([$this, 'maskPrivateEvent'], $events);
        }
        return $events;
    }

    /** @param array<string, mixed> $input @param array{id: string, name: string, color: string, role: string} $actor */
    public function create(array $input, array $actor): array
    {
        $calendarId = trim((string) ($input['calendarId'] ?? ''));
        if ($this->repository->findCalendar($calendarId) === null) {
            return $this->googleService->createEvent($input);
        }
        $now = gmdate('c');
        return $this->repository->createEvent($this->validate($input) + [
            'uuid' => $this->uuid(),
            'created_by_member_uuid' => $actor['id'],
            'created_at' => $now,
            'updated_at' => $now,
        ])->toArray();
    }

    /** @param array<string, mixed> $input */
    public function update(string $uuid, array $input): array
    {
        $existing = $this->repository->findEvent($uuid);
        if ($existing === null) {
            return $this->googleService->updateEvent($uuid, $input);
        }
        return $this->repository->updateEvent($uuid, $this->validate($input, $existing) + ['updated_at' => gmdate('c')])->toArray();
    }

    public function delete(string $uuid): void
    {
        if ($this->repository->findEvent($uuid) === null) { $this->googleService->deleteEvent($uuid); return; }
        $this->repository->softDeleteEvent($uuid);
    }

    /** @param array<string, mixed> $input */
    private function validate(array $input, ?CalendarEvent $existing = null): array
    {
        $title = array_key_exists('title', $input) ? trim((string) $input['title']) : ($existing?->title ?? '');
        if (mb_strlen($title) < 2 || mb_strlen($title) > 140) {
            throw new AppException('VALIDATION_ERROR', 'Der Titel muss zwischen 2 und 140 Zeichen lang sein.', 422);
        }

        $calendarId = array_key_exists('calendarId', $input) ? trim((string) $input['calendarId']) : ($existing?->calendarId ?? '');
        if ($calendarId === '' || $this->repository->findCalendar($calendarId) === null) {
            throw new AppException('VALIDATION_ERROR', 'Der ausgewählte Kalender wurde nicht gefunden.', 422);
        }

        $description = array_key_exists('description', $input) ? trim((string) $input['description']) : ($existing?->description ?? null);
        $description = $description === '' ? null : $description;
        if ($description !== null && mb_strlen($description) > 2_000) {
            throw new AppException('VALIDATION_ERROR', 'Die Beschreibung darf höchstens 2000 Zeichen lang sein.', 422);
        }

        $location = array_key_exists('location', $input) ? trim((string) $input['location']) : ($existing?->location ?? null);
        $location = $location === '' ? null : $location;
        if ($location !== null && mb_strlen($location) > 160) {
            throw new AppException('VALIDATION_ERROR', 'Der Ort darf höchstens 160 Zeichen lang sein.', 422);
        }

        $startsAt = $this->dateTime((string) ($input['startsAt'] ?? $existing?->startsAt ?? ''), 'Der Terminbeginn ist ungültig.');
        $endsAt = $this->dateTime((string) ($input['endsAt'] ?? $existing?->endsAt ?? ''), 'Das Terminende ist ungültig.');
        if ($endsAt <= $startsAt) {
            throw new AppException('VALIDATION_ERROR', 'Das Terminende muss nach dem Beginn liegen.', 422);
        }
        if ($endsAt->getTimestamp() - $startsAt->getTimestamp() > 366 * 86400) {
            throw new AppException('VALIDATION_ERROR', 'Ein einzelner Termin darf höchstens 366 Tage dauern.', 422);
        }

        $allDay = array_key_exists('allDay', $input)
            ? filter_var($input['allDay'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : ($existing?->allDay ?? false);
        if ($allDay === null) {
            throw new AppException('VALIDATION_ERROR', 'Die Ganztags-Einstellung ist ungültig.', 422);
        }

        $isPrivate = array_key_exists('isPrivate', $input)
            ? filter_var($input['isPrivate'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : ($existing?->isPrivate ?? false);
        if ($isPrivate === null) {
            throw new AppException('VALIDATION_ERROR', 'Die Privat-Einstellung ist ungültig.', 422);
        }

        $frequency = array_key_exists('recurrenceFrequency', $input)
            ? strtoupper(trim((string) $input['recurrenceFrequency']))
            : ($existing?->recurrenceFrequency ?? '');
        $frequency = $frequency === '' || $frequency === 'NONE' ? null : $frequency;
        if ($frequency !== null && !in_array($frequency, ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], true)) {
            throw new AppException('VALIDATION_ERROR', 'Die Wiederholung ist ungültig.', 422);
        }

        $interval = array_key_exists('recurrenceInterval', $input)
            ? filter_var($input['recurrenceInterval'], FILTER_VALIDATE_INT)
            : ($existing?->recurrenceInterval ?? 1);
        if ($interval === false || $interval < 1 || $interval > 12) {
            throw new AppException('VALIDATION_ERROR', 'Das Wiederholungsintervall muss zwischen 1 und 12 liegen.', 422);
        }

        $until = array_key_exists('recurrenceUntil', $input)
            ? trim((string) ($input['recurrenceUntil'] ?? ''))
            : ($existing?->recurrenceUntil ?? null);
        $until = $frequency === null || $until === '' ? null : $until;
        if ($until !== null) {
            $untilDate = DateTimeImmutable::createFromFormat('!Y-m-d', $until);
            if ($untilDate === false || $untilDate->format('Y-m-d') !== $until || $until < $startsAt->format('Y-m-d')) {
                throw new AppException('VALIDATION_ERROR', 'Das Ende der Wiederholung ist ungültig.', 422);
            }
        }

        return [
            'calendar_uuid' => $calendarId,
            'title' => $title,
            'description' => $description,
            'location' => $location,
            'starts_at' => $this->utc($startsAt),
            'ends_at' => $this->utc($endsAt),
            'all_day' => $allDay ? 1 : 0,
            'is_private' => $isPrivate ? 1 : 0,
            'recurrence_frequency' => $frequency,
            'recurrence_interval' => $frequency === null ? 1 : $interval,
            'recurrence_until' => $until,
        ];
    }

    /** @param array<string, mixed> $event @return array<string, mixed> */
    private function maskPrivateEvent(array $event): array
    {
        if (!(bool) ($event['isPrivate'] ?? false)) { return $event; }
        return array_replace($event, ['title' => 'Privater Termin', 'description' => null, 'location' => null, 'editable' => false]);
    }

    private function dateTime(string $value, string $message): DateTimeImmutable
    {
        if (strlen($value) > 40 || preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?(?:Z|[+-]\d{2}:\d{2})$/', $value) !== 1) {
            throw new AppException('VALIDATION_ERROR', $message, 422);
        }
        try {
            return new DateTimeImmutable($value);
        } catch (\Throwable) {
            throw new AppException('VALIDATION_ERROR', $message, 422);
        }
    }

    private function utc(DateTimeImmutable $date): string
    {
        return $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
