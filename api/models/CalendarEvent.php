<?php
declare(strict_types=1);

namespace FamilyCompass\Models;

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
        public string $updatedAt
    ) {}

    public static function fromRow(array $row): self
    {
        return new self($row['uuid'], $row['calendar_uuid'], $row['calendar_name'], $row['calendar_color'], $row['title'], $row['description'], $row['location'], $row['starts_at'], $row['ends_at'], (bool) $row['all_day'], (bool) ($row['is_private'] ?? false), $row['recurrence_frequency'] ?? null, (int) ($row['recurrence_interval'] ?? 1), $row['recurrence_until'] ?? null, $row['created_by_member_uuid'], $row['created_by_member_name'] ?? null, $row['created_at'], $row['updated_at']);
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
            ],
            'seriesId' => null,
            'createdBy' => ['id' => $this->createdByMemberId, 'name' => $this->createdByMemberName],
            'source' => 'LOCAL',
            'editable' => true,
            'createdAt' => $this->createdAt,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
