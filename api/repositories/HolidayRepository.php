<?php
declare(strict_types=1);

namespace FamilyHub\Repositories;

use PDO;
use Throwable;

final class HolidayRepository
{
    public function __construct(private PDO $database) {}

    public function settings(): ?array
    {
        $row = $this->database->query('SELECT * FROM holiday_settings WHERE id = 1')->fetch();
        return $row === false ? null : $row;
    }

    /** @return list<array<string, mixed>> */
    public function nextEvents(int $limit = 4): array
    {
        $statement = $this->database->prepare("SELECT e.title, e.starts_at, e.ends_at, s.name AS calendar_name FROM external_calendar_events e JOIN calendar_sources s ON s.uuid = e.source_uuid WHERE s.provider = 'OPEN_HOLIDAYS' AND s.deleted_at IS NULL AND s.is_active = 1 AND e.ends_at >= :today ORDER BY e.starts_at, e.ends_at LIMIT :limit");
        $statement->bindValue(':today', gmdate('Y-m-d\T00:00:00\Z'));
        $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
        $statement->execute();
        return array_map(static fn (array $row): array => ['title' => $row['title'], 'startsAt' => $row['starts_at'], 'endsAt' => $row['ends_at'], 'calendarName' => $row['calendar_name']], $statement->fetchAll());
    }

    /** @param array{PUBLIC?: list<array<string, mixed>>, SCHOOL?: list<array<string, mixed>>} $datasets */
    public function save(string $subdivision, string $regionName, bool $publicEnabled, bool $schoolEnabled, string $actorId, array $datasets, string $from, string $to): void
    {
        $existing = $this->settings();
        $now = gmdate('c');
        $this->database->beginTransaction();
        try {
            $publicUuid = $this->upsertSource('PUBLIC', $existing['public_source_uuid'] ?? null, $regionName, $publicEnabled, $actorId, $now);
            $schoolUuid = $this->upsertSource('SCHOOL', $existing['school_source_uuid'] ?? null, $regionName, $schoolEnabled, $actorId, $now);
            if ($publicEnabled) { $this->replaceEvents($publicUuid, $datasets['PUBLIC'] ?? [], $from, $to, $now); }
            if ($schoolEnabled) { $this->replaceEvents($schoolUuid, $datasets['SCHOOL'] ?? [], $from, $to, $now); }
            $statement = $this->database->prepare('INSERT INTO holiday_settings (id, country_code, subdivision_code, public_enabled, school_enabled, public_source_uuid, school_source_uuid, created_by_member_uuid, created_at, updated_at) VALUES (1, :country, :subdivision, :public_enabled, :school_enabled, :public_uuid, :school_uuid, :actor, :created_at, :updated_at) ON CONFLICT(id) DO UPDATE SET subdivision_code = excluded.subdivision_code, public_enabled = excluded.public_enabled, school_enabled = excluded.school_enabled, public_source_uuid = excluded.public_source_uuid, school_source_uuid = excluded.school_source_uuid, updated_at = excluded.updated_at');
            $statement->execute(['country' => 'DE', 'subdivision' => $subdivision, 'public_enabled' => $publicEnabled ? 1 : 0, 'school_enabled' => $schoolEnabled ? 1 : 0, 'public_uuid' => $publicUuid, 'school_uuid' => $schoolUuid, 'actor' => $actorId, 'created_at' => $existing['created_at'] ?? $now, 'updated_at' => $now]);
            $this->database->commit();
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    public function isStale(string $before): bool
    {
        $settings = $this->settings();
        if ($settings === null) { return false; }
        foreach (['public' => 'public_source_uuid', 'school' => 'school_source_uuid'] as $kind => $column) {
            if (!(bool) $settings[$kind . '_enabled']) { continue; }
            $statement = $this->database->prepare('SELECT last_synced_at FROM calendar_sources WHERE uuid = :uuid AND deleted_at IS NULL');
            $statement->execute(['uuid' => $settings[$column]]);
            $synced = $statement->fetchColumn();
            if (!is_string($synced) || $synced < $before) { return true; }
        }
        return false;
    }

    public function markError(string $message): void
    {
        $settings = $this->settings();
        if ($settings === null) { return; }
        $statement = $this->database->prepare("UPDATE calendar_sources SET last_sync_status = 'ERROR', last_sync_message = :message, updated_at = :updated_at WHERE uuid IN (:public_uuid, :school_uuid) AND is_active = 1");
        $statement->execute(['message' => mb_substr($message, 0, 240), 'updated_at' => gmdate('c'), 'public_uuid' => $settings['public_source_uuid'], 'school_uuid' => $settings['school_source_uuid']]);
    }

    public function remove(): void
    {
        $settings = $this->settings();
        if ($settings === null) { return; }
        $ids = array_filter([$settings['public_source_uuid'], $settings['school_source_uuid']]);
        $this->database->beginTransaction();
        try {
            foreach ($ids as $uuid) {
                $deleteEvents = $this->database->prepare('DELETE FROM external_calendar_events WHERE source_uuid = :uuid');
                $deleteEvents->execute(['uuid' => $uuid]);
                $deleteSource = $this->database->prepare('UPDATE calendar_sources SET deleted_at = :now, is_active = 0, updated_at = :now WHERE uuid = :uuid');
                $deleteSource->execute(['uuid' => $uuid, 'now' => gmdate('c')]);
            }
            $this->database->exec('DELETE FROM holiday_settings WHERE id = 1');
            $this->database->commit();
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    private function upsertSource(string $kind, mixed $existingUuid, string $regionName, bool $active, string $actorId, string $now): string
    {
        $uuid = is_string($existingUuid) && $existingUuid !== '' ? $existingUuid : $this->uuid();
        $name = ($kind === 'PUBLIC' ? 'Feiertage · ' : 'Schulferien · ') . $regionName;
        $color = $kind === 'PUBLIC' ? '#D09A38' : '#6C8AB8';
        $statement = $this->database->prepare("INSERT INTO calendar_sources (uuid, name, provider, source_url_encrypted, color, is_active, last_sync_status, created_by_member_uuid, created_at, updated_at) VALUES (:uuid, :name, 'OPEN_HOLIDAYS', '', :color, :active, 'NEVER', :actor, :created_at, :updated_at) ON CONFLICT(uuid) DO UPDATE SET name = excluded.name, color = excluded.color, is_active = excluded.is_active, deleted_at = NULL, updated_at = excluded.updated_at");
        $statement->execute(['uuid' => $uuid, 'name' => $name, 'color' => $color, 'active' => $active ? 1 : 0, 'actor' => $actorId, 'created_at' => $now, 'updated_at' => $now]);
        return $uuid;
    }

    /** @param list<array<string, mixed>> $events */
    private function replaceEvents(string $sourceUuid, array $events, string $from, string $to, string $now): void
    {
        $delete = $this->database->prepare('DELETE FROM external_calendar_events WHERE source_uuid = :uuid');
        $delete->execute(['uuid' => $sourceUuid]);
        $insert = $this->database->prepare('INSERT INTO external_calendar_events (uuid, source_uuid, external_uid, title, description, location, starts_at, ends_at, all_day, is_private, created_at, updated_at) VALUES (:uuid, :source_uuid, :external_uid, :title, :description, :location, :starts_at, :ends_at, :all_day, :is_private, :created_at, :updated_at)');
        foreach ($events as $event) {
            $externalUid = (string) $event['uuid'];
            $insert->execute(array_replace($event, ['uuid' => $this->eventUuid($sourceUuid . '|' . $externalUid), 'source_uuid' => $sourceUuid, 'external_uid' => $externalUid, 'created_at' => $now, 'updated_at' => $now]));
        }
        $status = $this->database->prepare("UPDATE calendar_sources SET last_synced_at = :now, last_sync_status = 'SUCCESS', last_sync_message = :message, sync_window_start = :window_start, sync_window_end = :window_end, updated_at = :now WHERE uuid = :uuid");
        $status->execute(['uuid' => $sourceUuid, 'now' => $now, 'message' => count($events) . ' Einträge synchronisiert.', 'window_start' => $from . 'T00:00:00Z', 'window_end' => $to . 'T23:59:59Z']);
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }

    private function eventUuid(string $value): string
    {
        $bytes = substr(hash('sha256', $value, true), 0, 16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x50); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
