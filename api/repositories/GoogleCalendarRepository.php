<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class GoogleCalendarRepository
{
    public function __construct(private PDO $database) {}

    /** @return list<array<string, mixed>> */
    public function allSources(): array
    {
        return $this->database->query($this->sourceSelect() . ' WHERE deleted_at IS NULL ORDER BY is_primary DESC, name')->fetchAll();
    }

    /** @return list<array<string, mixed>> */
    public function activeSources(): array
    {
        return $this->database->query($this->sourceSelect() . ' WHERE deleted_at IS NULL AND is_active = 1 ORDER BY is_primary DESC, name')->fetchAll();
    }

    /** @return list<array<string, mixed>> */
    public function dueForSync(string $before, int $limit = 2): array
    {
        $statement = $this->database->prepare($this->sourceSelect() . ' WHERE deleted_at IS NULL AND is_active = 1 AND (last_synced_at IS NULL OR last_synced_at < :before) ORDER BY COALESCE(last_synced_at, \'\') LIMIT :limit');
        $statement->bindValue(':before', $before);
        $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
        $statement->execute();
        return $statement->fetchAll();
    }

    /** @return array<string, mixed>|null */
    public function findSource(string $uuid): ?array
    {
        $statement = $this->database->prepare($this->sourceSelect() . ' WHERE uuid = :uuid AND deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    /** @return array<string, mixed>|null */
    public function findSourceByHash(string $hash): ?array
    {
        $statement = $this->database->prepare($this->sourceSelect() . ' WHERE external_id_hash = :hash AND deleted_at IS NULL LIMIT 1');
        $statement->execute(['hash' => $hash]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    /** @param array<string, mixed> $data */
    public function upsertSource(array $data): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO google_calendar_sources (uuid, external_id_hash, external_id_encrypted, name, color, access_role, is_primary, is_active, created_at, updated_at)
             VALUES (:uuid, :external_id_hash, :external_id_encrypted, :name, :color, :access_role, :is_primary, :is_active, :created_at, :updated_at)
             ON CONFLICT(external_id_hash) DO UPDATE SET external_id_encrypted = excluded.external_id_encrypted,
                name = excluded.name, color = excluded.color, access_role = excluded.access_role,
                is_primary = excluded.is_primary, deleted_at = NULL, updated_at = excluded.updated_at'
        );
        $statement->execute($data);
        return $this->findSourceByHash((string) $data['external_id_hash']) ?? throw new \RuntimeException('Google calendar source was not saved.');
    }

    public function setSourceActive(string $uuid, bool $active): bool
    {
        $statement = $this->database->prepare('UPDATE google_calendar_sources SET is_active = :active, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute(['active' => $active ? 1 : 0, 'updated_at' => gmdate('c'), 'uuid' => $uuid]);
        return $statement->rowCount() === 1;
    }

    /** @param list<array<string, mixed>> $events */
    public function replaceEvents(string $sourceUuid, array $events): void
    {
        $this->database->beginTransaction();
        try {
            $delete = $this->database->prepare('DELETE FROM google_calendar_events WHERE source_uuid = :source_uuid');
            $delete->execute(['source_uuid' => $sourceUuid]);
            $insert = $this->database->prepare('INSERT INTO google_calendar_events (uuid, source_uuid, external_event_id, title, description, location, starts_at, ends_at, all_day, created_at, updated_at) VALUES (:uuid, :source_uuid, :external_event_id, :title, :description, :location, :starts_at, :ends_at, :all_day, :created_at, :updated_at)');
            foreach ($events as $event) { $insert->execute($event); }
            $status = $this->database->prepare("UPDATE google_calendar_sources SET last_synced_at = :synced_at, last_sync_status = 'SUCCESS', last_sync_message = :message, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL");
            $now = gmdate('c');
            $status->execute(['synced_at' => $now, 'message' => count($events) . ' Termine synchronisiert.', 'updated_at' => $now, 'uuid' => $sourceUuid]);
            $this->database->commit();
        } catch (\Throwable $exception) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $exception;
        }
    }

    /** @param array<string, mixed> $event */
    public function upsertEvent(array $event): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO google_calendar_events (uuid, source_uuid, external_event_id, title, description, location, starts_at, ends_at, all_day, created_at, updated_at)
             VALUES (:uuid, :source_uuid, :external_event_id, :title, :description, :location, :starts_at, :ends_at, :all_day, :created_at, :updated_at)
             ON CONFLICT(source_uuid, external_event_id) DO UPDATE SET title = excluded.title, description = excluded.description,
                location = excluded.location, starts_at = excluded.starts_at, ends_at = excluded.ends_at,
                all_day = excluded.all_day, updated_at = excluded.updated_at'
        );
        $statement->execute($event);
    }

    /** @return array<string, mixed>|null */
    public function findEvent(string $uuid): ?array
    {
        $statement = $this->database->prepare($this->eventSelect() . ' WHERE e.uuid = :uuid AND s.deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    public function deleteEvent(string $uuid): void
    {
        $statement = $this->database->prepare('DELETE FROM google_calendar_events WHERE uuid = :uuid');
        $statement->execute(['uuid' => $uuid]);
    }

    /** @return list<array<string, mixed>> */
    public function eventsBetween(string $from, string $to): array
    {
        $statement = $this->database->prepare($this->eventSelect() . ' WHERE s.deleted_at IS NULL AND s.is_active = 1 AND e.starts_at < :to AND e.ends_at > :from ORDER BY e.starts_at, e.ends_at, e.title');
        $statement->execute(['from' => $from, 'to' => $to]);
        return array_map([$this, 'presentEvent'], $statement->fetchAll());
    }

    public function markSyncError(string $uuid, string $message): void
    {
        $statement = $this->database->prepare("UPDATE google_calendar_sources SET last_sync_status = 'ERROR', last_sync_message = :message, updated_at = :updated_at WHERE uuid = :uuid");
        $statement->execute(['message' => $message, 'updated_at' => gmdate('c'), 'uuid' => $uuid]);
    }

    public function clearAll(): void
    {
        $this->database->exec('DELETE FROM google_calendar_events');
        $this->database->exec('DELETE FROM google_calendar_sources');
    }

    public function householdTimezone(): string
    {
        return (string) ($this->database->query('SELECT timezone FROM households ORDER BY id LIMIT 1')->fetchColumn() ?: 'Europe/Berlin');
    }

    private function sourceSelect(): string
    {
        return 'SELECT uuid, external_id_hash, external_id_encrypted, name, color, access_role, is_primary, is_active, last_synced_at, last_sync_status, last_sync_message, created_at, updated_at FROM google_calendar_sources';
    }

    private function eventSelect(): string
    {
        return 'SELECT e.*, s.name AS calendar_name, s.color AS calendar_color, s.access_role FROM google_calendar_events e JOIN google_calendar_sources s ON s.uuid = e.source_uuid';
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function presentEvent(array $row): array
    {
        return [
            'id' => $row['uuid'],
            'calendar' => ['id' => $row['source_uuid'], 'name' => $row['calendar_name'], 'color' => $row['calendar_color']],
            'title' => $row['title'], 'description' => $row['description'], 'location' => $row['location'],
            'startsAt' => $row['starts_at'], 'endsAt' => $row['ends_at'], 'allDay' => (bool) $row['all_day'],
            'createdBy' => null, 'source' => 'GOOGLE', 'editable' => in_array($row['access_role'], ['owner', 'writer'], true),
            'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at'],
        ];
    }
}
