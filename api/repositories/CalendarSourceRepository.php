<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;
use Throwable;

final class CalendarSourceRepository
{
    public function __construct(private PDO $database) {}

    /** @return list<array<string, mixed>> */
    public function all(): array
    {
        return $this->database->query($this->sourceSelect() . ' WHERE deleted_at IS NULL ORDER BY name COLLATE NOCASE')->fetchAll();
    }

    /** @return list<array<string, mixed>> */
    public function activeCalendars(): array
    {
        $rows = $this->database->query($this->sourceSelect() . ' WHERE deleted_at IS NULL AND is_active = 1 ORDER BY name COLLATE NOCASE')->fetchAll();
        return array_map(static fn (array $row): array => [
            'id' => $row['uuid'],
            'name' => $row['name'],
            'color' => $row['color'],
            'type' => 'EXTERNAL',
            'ownerMember' => null,
            'isActive' => true,
        ], $rows);
    }

    /** @return list<array<string, mixed>> */
    public function dueForSync(string $before, int $limit = 2): array
    {
        $statement = $this->database->prepare($this->sourceSelect() . ' WHERE deleted_at IS NULL AND is_active = 1 AND COALESCE(last_synced_at, updated_at) < :before ORDER BY COALESCE(last_synced_at, updated_at) LIMIT :limit');
        $statement->bindValue(':before', $before);
        $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
        $statement->execute();
        return $statement->fetchAll();
    }

    public function find(string $uuid): ?array
    {
        $statement = $this->database->prepare($this->sourceSelect() . ' WHERE uuid = :uuid AND deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    public function create(array $data): array
    {
        $statement = $this->database->prepare('INSERT INTO calendar_sources (uuid, name, provider, source_url_encrypted, color, is_active, last_sync_status, created_by_member_uuid, created_at, updated_at) VALUES (:uuid, :name, :provider, :source_url_encrypted, :color, :is_active, :last_sync_status, :created_by_member_uuid, :created_at, :updated_at)');
        $statement->execute($data);
        return $this->find($data['uuid']) ?? throw new \RuntimeException('Created calendar source could not be retrieved.');
    }

    public function update(string $uuid, array $data): array
    {
        $statement = $this->database->prepare('UPDATE calendar_sources SET name = :name, source_url_encrypted = :source_url_encrypted, color = :color, is_active = :is_active, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute($data + ['uuid' => $uuid]);
        return $this->find($uuid) ?? throw new \RuntimeException('Updated calendar source could not be retrieved.');
    }

    /** @param list<array<string, mixed>> $events */
    public function replaceEvents(string $sourceUuid, array $events, string $windowStart, string $windowEnd): void
    {
        $now = gmdate('c');
        $this->database->beginTransaction();
        try {
            $delete = $this->database->prepare('DELETE FROM external_calendar_events WHERE source_uuid = :source_uuid');
            $delete->execute(['source_uuid' => $sourceUuid]);
            $insert = $this->database->prepare('INSERT INTO external_calendar_events (uuid, source_uuid, external_uid, title, description, location, starts_at, ends_at, all_day, created_at, updated_at) VALUES (:uuid, :source_uuid, :external_uid, :title, :description, :location, :starts_at, :ends_at, :all_day, :created_at, :updated_at)');
            foreach ($events as $event) {
                $event['uuid'] = $this->eventUuid($sourceUuid . '|' . $event['uuid']);
                $insert->execute($event + ['source_uuid' => $sourceUuid, 'created_at' => $now, 'updated_at' => $now]);
            }
            $status = $this->database->prepare("UPDATE calendar_sources SET last_synced_at = :synced_at, last_sync_status = 'SUCCESS', last_sync_message = :message, sync_window_start = :window_start, sync_window_end = :window_end, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL");
            $status->execute([
                'uuid' => $sourceUuid,
                'synced_at' => $now,
                'message' => count($events) . ' Termine synchronisiert.',
                'window_start' => $windowStart,
                'window_end' => $windowEnd,
                'updated_at' => $now,
            ]);
            $this->database->commit();
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    public function markSyncError(string $uuid, string $message): void
    {
        $statement = $this->database->prepare("UPDATE calendar_sources SET last_sync_status = 'ERROR', last_sync_message = :message, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL");
        $statement->execute(['uuid' => $uuid, 'message' => mb_substr($message, 0, 240), 'updated_at' => gmdate('c')]);
    }

    public function delete(string $uuid): bool
    {
        $this->database->beginTransaction();
        try {
            $events = $this->database->prepare('DELETE FROM external_calendar_events WHERE source_uuid = :uuid');
            $events->execute(['uuid' => $uuid]);
            $source = $this->database->prepare('UPDATE calendar_sources SET deleted_at = :deleted_at, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
            $now = gmdate('c');
            $source->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
            $deleted = $source->rowCount() === 1;
            $this->database->commit();
            return $deleted;
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    /** @return list<array<string, mixed>> */
    public function eventsBetween(string $from, string $to): array
    {
        $statement = $this->database->prepare("SELECT e.*, s.name AS calendar_name, s.color AS calendar_color FROM external_calendar_events e JOIN calendar_sources s ON s.uuid = e.source_uuid WHERE s.deleted_at IS NULL AND s.is_active = 1 AND e.starts_at < :to AND e.ends_at > :from ORDER BY e.starts_at, e.ends_at, e.title");
        $statement->execute(['from' => $from, 'to' => $to]);
        return array_map(static fn (array $row): array => [
            'id' => $row['uuid'],
            'calendar' => ['id' => $row['source_uuid'], 'name' => $row['calendar_name'], 'color' => $row['calendar_color']],
            'title' => $row['title'],
            'description' => $row['description'],
            'location' => $row['location'],
            'startsAt' => $row['starts_at'],
            'endsAt' => $row['ends_at'],
            'allDay' => (bool) $row['all_day'],
            'createdBy' => null,
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
            'source' => 'EXTERNAL',
            'editable' => false,
        ], $statement->fetchAll());
    }

    public function householdTimezone(): string
    {
        $timezone = $this->database->query('SELECT timezone FROM households ORDER BY id LIMIT 1')->fetchColumn();
        return is_string($timezone) && $timezone !== '' ? $timezone : 'Europe/Berlin';
    }

    private function sourceSelect(): string
    {
        return 'SELECT uuid, name, provider, source_url_encrypted, color, is_active, last_synced_at, last_sync_status, last_sync_message, sync_window_start, sync_window_end, created_at, updated_at FROM calendar_sources';
    }

    private function eventUuid(string $value): string
    {
        $bytes = substr(hash('sha256', $value, true), 0, 16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x50);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
