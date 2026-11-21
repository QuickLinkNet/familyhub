<?php
declare(strict_types=1);

namespace FamilyHub\Repositories;

use FamilyHub\Models\Calendar;
use FamilyHub\Models\CalendarEvent;
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
        $rows = $statement->fetchAll();
        $members = $this->membersForEvents(array_column($rows, 'uuid'));
        return array_map(static fn (array $row): CalendarEvent => CalendarEvent::fromRow($row, $members[$row['uuid']] ?? []), $rows);
    }

    public function findEvent(string $uuid): ?CalendarEvent
    {
        $statement = $this->database->prepare($this->eventSelect() . ' WHERE e.uuid = :uuid AND e.deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        if ($row === false) { return null; }
        $members = $this->membersForEvents([(string) $row['uuid']]);
        return CalendarEvent::fromRow($row, $members[$row['uuid']] ?? []);
    }

    /** @param list<string> $memberIds */
    public function createEvent(array $data, array $memberIds): CalendarEvent
    {
        $this->database->beginTransaction();
        try {
            $statement = $this->database->prepare('INSERT INTO calendar_events (uuid, calendar_uuid, title, description, location, starts_at, ends_at, all_day, is_private, recurrence_frequency, recurrence_interval, recurrence_until, recurrence_weekdays_json, created_by_member_uuid, created_at, updated_at) VALUES (:uuid, :calendar_uuid, :title, :description, :location, :starts_at, :ends_at, :all_day, :is_private, :recurrence_frequency, :recurrence_interval, :recurrence_until, :recurrence_weekdays_json, :created_by_member_uuid, :created_at, :updated_at)');
            $statement->execute($data);
            $this->replaceMembers((string) $data['uuid'], $memberIds);
            $this->database->commit();
        } catch (\Throwable $exception) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $exception;
        }
        return $this->findEvent($data['uuid']) ?? throw new \RuntimeException('Created calendar event could not be retrieved.');
    }

    /** @param list<string> $memberIds */
    public function updateEvent(string $uuid, array $data, array $memberIds): CalendarEvent
    {
        $this->database->beginTransaction();
        try {
            $statement = $this->database->prepare('UPDATE calendar_events SET calendar_uuid = :calendar_uuid, title = :title, description = :description, location = :location, starts_at = :starts_at, ends_at = :ends_at, all_day = :all_day, is_private = :is_private, recurrence_frequency = :recurrence_frequency, recurrence_interval = :recurrence_interval, recurrence_until = :recurrence_until, recurrence_weekdays_json = :recurrence_weekdays_json, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
            $statement->execute($data + ['uuid' => $uuid]);
            $this->replaceMembers($uuid, $memberIds);
            $this->database->commit();
        } catch (\Throwable $exception) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $exception;
        }
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

    /** @param list<string> $eventIds @return array<string, list<array{id: string, name: string, color: string}>> */
    private function membersForEvents(array $eventIds): array
    {
        if ($eventIds === []) { return []; }
        $placeholders = implode(',', array_fill(0, count($eventIds), '?'));
        $statement = $this->database->prepare("SELECT em.event_uuid, fm.uuid, fm.name, fm.color FROM calendar_event_members em JOIN family_members fm ON fm.uuid = em.member_uuid WHERE em.event_uuid IN ($placeholders) AND fm.deleted_at IS NULL AND fm.is_active = 1 ORDER BY em.event_uuid, em.position, fm.name");
        $statement->execute($eventIds);
        $result = [];
        foreach ($statement->fetchAll() as $row) {
            $result[$row['event_uuid']][] = ['id' => $row['uuid'], 'name' => $row['name'], 'color' => $row['color']];
        }
        return $result;
    }

    /** @param list<string> $memberIds */
    private function replaceMembers(string $eventId, array $memberIds): void
    {
        $delete = $this->database->prepare('DELETE FROM calendar_event_members WHERE event_uuid = :event_uuid');
        $delete->execute(['event_uuid' => $eventId]);
        $insert = $this->database->prepare('INSERT INTO calendar_event_members (event_uuid, member_uuid, position) VALUES (:event_uuid, :member_uuid, :position)');
        foreach ($memberIds as $position => $memberId) {
            $insert->execute(['event_uuid' => $eventId, 'member_uuid' => $memberId, 'position' => $position]);
        }
    }
}
