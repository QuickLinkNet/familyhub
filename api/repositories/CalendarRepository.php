<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use FamilyCompass\Models\Calendar;
use FamilyCompass\Models\CalendarEvent;
use PDO;

final class CalendarRepository
{
    public function __construct(private PDO $database) {}

    /** @return list<Calendar> */
    public function allCalendars(): array
    {
        $statement = $this->database->query('SELECT c.*, fm.name AS owner_member_name FROM calendars c LEFT JOIN family_members fm ON fm.uuid = c.owner_member_uuid WHERE c.deleted_at IS NULL AND c.is_active = 1 ORDER BY CASE c.calendar_type WHEN \'SHARED\' THEN 0 ELSE 1 END, c.name');
        return array_map(static fn (array $row): Calendar => Calendar::fromRow($row), $statement->fetchAll());
    }

    public function findCalendar(string $uuid): ?Calendar
    {
        $statement = $this->database->prepare('SELECT c.*, fm.name AS owner_member_name FROM calendars c LEFT JOIN family_members fm ON fm.uuid = c.owner_member_uuid WHERE c.uuid = :uuid AND c.deleted_at IS NULL AND c.is_active = 1 LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : Calendar::fromRow($row);
    }

    /** @return list<CalendarEvent> */
    public function eventsBetween(string $from, string $to): array
    {
        $statement = $this->database->prepare($this->eventSelect() . ' WHERE e.deleted_at IS NULL AND c.deleted_at IS NULL AND c.is_active = 1 AND ((e.recurrence_frequency IS NULL AND e.starts_at < :to AND e.ends_at > :from) OR (e.recurrence_frequency IS NOT NULL AND e.starts_at < :to AND (e.recurrence_until IS NULL OR e.recurrence_until >= substr(:from, 1, 10)))) ORDER BY e.starts_at, e.ends_at, e.title');
        $statement->execute(['from' => $from, 'to' => $to]);
        return array_map(static fn (array $row): CalendarEvent => CalendarEvent::fromRow($row), $statement->fetchAll());
    }

    public function findEvent(string $uuid): ?CalendarEvent
    {
        $statement = $this->database->prepare($this->eventSelect() . ' WHERE e.uuid = :uuid AND e.deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : CalendarEvent::fromRow($row);
    }

    public function createEvent(array $data): CalendarEvent
    {
        $statement = $this->database->prepare('INSERT INTO calendar_events (uuid, calendar_uuid, title, description, location, starts_at, ends_at, all_day, recurrence_frequency, recurrence_interval, recurrence_until, created_by_member_uuid, created_at, updated_at) VALUES (:uuid, :calendar_uuid, :title, :description, :location, :starts_at, :ends_at, :all_day, :recurrence_frequency, :recurrence_interval, :recurrence_until, :created_by_member_uuid, :created_at, :updated_at)');
        $statement->execute($data);
        return $this->findEvent($data['uuid']) ?? throw new \RuntimeException('Created calendar event could not be retrieved.');
    }

    public function updateEvent(string $uuid, array $data): CalendarEvent
    {
        $statement = $this->database->prepare('UPDATE calendar_events SET calendar_uuid = :calendar_uuid, title = :title, description = :description, location = :location, starts_at = :starts_at, ends_at = :ends_at, all_day = :all_day, recurrence_frequency = :recurrence_frequency, recurrence_interval = :recurrence_interval, recurrence_until = :recurrence_until, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute($data + ['uuid' => $uuid]);
        return $this->findEvent($uuid) ?? throw new \RuntimeException('Updated calendar event could not be retrieved.');
    }

    public function softDeleteEvent(string $uuid): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare('UPDATE calendar_events SET deleted_at = :deleted_at, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount() === 1;
    }

    private function eventSelect(): string
    {
        return 'SELECT e.*, c.name AS calendar_name, c.color AS calendar_color, fm.name AS created_by_member_name FROM calendar_events e JOIN calendars c ON c.uuid = e.calendar_uuid LEFT JOIN family_members fm ON fm.uuid = e.created_by_member_uuid';
    }
}
