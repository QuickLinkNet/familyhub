<?php
declare(strict_types=1);

namespace FamilyHub\Models;

final class CalendarEvent
{
    public function __construct(
        public string $uuid,
        public string $calendarId,
        public string $calendarName,
        public string $calendarColor,
        public string $title,
        public ?string $description,
        public ?string $location,
        public string $startsAt,
        public string $endsAt,
        public bool $allDay,
        public bool $isPrivate,
        public ?string $recurrenceFrequency,
        public int $recurrenceInterval,
        public ?string $recurrenceUntil,
        public string $createdByMemberId,
        public ?string $createdByMemberName,
        public string $createdAt,
        public string $updatedAt,
        /** @var list<array{id: string, name: string, color: string}> */
        public array $members = [],
        /** @var list<int> ISO weekdays from 1 (Monday) to 7 (Sunday) */
        public array $recurrenceWeekdays = [],
        /** @var list<int> Minutes before the event start */
        public array $reminderOffsets = [120],
        public bool $boardSound = false
    ) {}

    /** @param list<array{id: string, name: string, color: string}> $members */
    public static function fromRow(array $row, array $members = []): self
    {
        $weekdays = json_decode((string) ($row['recurrence_weekdays_json'] ?? '[]'), true);
        $weekdays = is_array($weekdays) ? array_values(array_unique(array_filter(array_map('intval', $weekdays), static fn (int $day): bool => $day >= 1 && $day <= 7))) : [];
        sort($weekdays);
        $offsets = json_decode((string) ($row['reminder_offsets_json'] ?? '[120]'), true);
        $offsets = is_array($offsets) ? array_values(array_unique(array_map('intval', $offsets))) : [120];
        rsort($offsets);
        return new self($row['uuid'], $row['calendar_uuid'], $row['calendar_name'], $row['calendar_color'], $row['title'], $row['description'], $row['location'], $row['starts_at'], $row['ends_at'], (bool) $row['all_day'], (bool) ($row['is_private'] ?? false), $row['recurrence_frequency'] ?? null, (int) ($row['recurrence_interval'] ?? 1), $row['recurrence_until'] ?? null, $row['created_by_member_uuid'], $row['created_by_member_name'] ?? null, $row['created_at'], $row['updated_at'], $members, $weekdays, $offsets, (bool) ($row['board_sound'] ?? false));
    }

    public function toArray(): array
    {
        return [
            'id' => $this->uuid,
            'calendar' => ['id' => $this->calendarId, 'name' => $this->calendarName, 'color' => $this->calendarColor],
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'startsAt' => $this->startsAt,
            'endsAt' => $this->endsAt,
            'allDay' => $this->allDay,
            'isPrivate' => $this->isPrivate,
            'recurrence' => $this->recurrenceFrequency === null ? null : [
                'frequency' => $this->recurrenceFrequency,
                'interval' => $this->recurrenceInterval,
                'until' => $this->recurrenceUntil,
                'weekdays' => $this->recurrenceWeekdays,
            ],
            'seriesId' => null,
            'reminders' => ['offsetsMinutes' => $this->reminderOffsets, 'boardSound' => $this->boardSound],
            'createdBy' => ['id' => $this->createdByMemberId, 'name' => $this->createdByMemberName],
            'members' => $this->members,
            'source' => 'LOCAL',
            'editable' => true,
            'createdAt' => $this->createdAt,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
