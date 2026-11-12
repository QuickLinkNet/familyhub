<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use DateTimeZone;
use FamilyCompass\Core\AppException;
use FamilyCompass\Core\SecretCipher;
use FamilyCompass\Repositories\GoogleCalendarRepository;

final class GoogleCalendarService
{
    private const WRITABLE_ROLES = ['owner', 'writer'];

    public function __construct(
        private GoogleCalendarRepository $repository,
        private GoogleOAuthService $oauth,
        private GoogleApiClient $client,
        private SecretCipher $cipher
    ) {}

    /** @return list<array<string, mixed>> */
    public function sources(): array
    {
        return array_map(fn (array $source): array => $this->presentSource($source), $this->repository->allSources());
    }

    /** @return list<array<string, mixed>> */
    public function calendars(): array
    {
        return array_map(static fn (array $source): array => [
            'id' => $source['uuid'], 'name' => $source['name'], 'color' => $source['color'],
            'type' => 'GOOGLE', 'ownerMember' => null, 'isActive' => true,
            'writable' => in_array($source['access_role'], self::WRITABLE_ROLES, true),
        ], $this->repository->activeSources());
    }

    /** @return list<array<string, mixed>> */
    public function eventsBetween(string $from, string $to): array
    {
        return $this->repository->eventsBetween($from, $to);
    }

    public function importCalendars(?string $accessToken = null): void
    {
        $token = $accessToken ?? $this->oauth->accessToken();
        $pageToken = null;
        $primaryLabel = null;
        do {
            $query = ['maxResults' => 250];
            if ($pageToken !== null) { $query['pageToken'] = $pageToken; }
            $response = $this->client->calendar('GET', 'users/me/calendarList', $token, $query);
            foreach (($response['items'] ?? []) as $calendar) {
                if (!is_array($calendar) || !isset($calendar['id'])) { continue; }
                $externalId = (string) $calendar['id'];
                $hash = $this->cipher->fingerprint($externalId);
                $existing = $this->repository->findSourceByHash($hash);
                $isPrimary = (bool) ($calendar['primary'] ?? false);
                $color = (string) ($calendar['backgroundColor'] ?? '#4285F4');
                if (preg_match('/^#[0-9a-fA-F]{6}$/', $color) !== 1) { $color = '#4285F4'; }
                $now = gmdate('c');
                $this->repository->upsertSource([
                    'uuid' => $existing['uuid'] ?? $this->uuid(),
                    'external_id_hash' => $hash,
                    'external_id_encrypted' => $this->cipher->encrypt($externalId),
                    'name' => $this->text((string) ($calendar['summaryOverride'] ?? $calendar['summary'] ?? 'Google-Kalender'), 120),
                    'color' => strtoupper($color),
                    'access_role' => (string) ($calendar['accessRole'] ?? 'reader'),
                    'is_primary' => $isPrimary ? 1 : 0,
                    'is_active' => $existing === null && $isPrimary ? 1 : (int) ($existing['is_active'] ?? 0),
                    'created_at' => $now, 'updated_at' => $now,
                ]);
                if ($isPrimary) { $primaryLabel = (string) ($calendar['summary'] ?? $externalId); }
            }
            $pageToken = isset($response['nextPageToken']) ? (string) $response['nextPageToken'] : null;
        } while ($pageToken !== null && $pageToken !== '');
        if ($primaryLabel !== null) { $this->oauth->setAccountLabel($this->text($primaryLabel, 160)); }
        foreach ($this->repository->activeSources() as $source) {
            try { $this->synchronizeSource($source, $token); }
            catch (AppException $exception) { $this->repository->markSyncError($source['uuid'], $exception->getMessage()); }
        }
    }

    /** @return array<string, mixed> */
    public function setSourceActive(string $uuid, bool $active): array
    {
        if (!$this->repository->setSourceActive($uuid, $active)) {
            throw new AppException('NOT_FOUND', 'Der Google-Kalender wurde nicht gefunden.', 404);
        }
        $source = $this->requireSource($uuid);
        if ($active) {
            try { $this->synchronizeSource($source); }
            catch (AppException $exception) {
                $this->repository->markSyncError($source['uuid'], $exception->getMessage());
                throw $exception;
            }
        }
        return $this->presentSource($this->requireSource($uuid));
    }

    public function synchronizeStale(): void
    {
        foreach ($this->repository->dueForSync(gmdate('c', time() - 900)) as $source) {
            try { $this->synchronizeSource($source); }
            catch (AppException $exception) { $this->repository->markSyncError($source['uuid'], $exception->getMessage()); }
        }
    }

    /** @return array<string, mixed> */
    public function synchronize(string $uuid): array
    {
        $source = $this->requireSource($uuid);
        try { $this->synchronizeSource($source); }
        catch (AppException $exception) {
            $this->repository->markSyncError($source['uuid'], $exception->getMessage());
            throw $exception;
        }
        return $this->presentSource($this->requireSource($uuid));
    }

    /** @return array<string, mixed> */
    public function verifyConnection(): array
    {
        $token = $this->oauth->accessToken();
        $sources = $this->repository->activeSources();
        $synced = 0; $errors = [];
        foreach ($sources as $source) {
            try { $this->synchronizeSource($source, $token); $synced++; }
            catch (AppException $exception) {
                $this->repository->markSyncError((string) $source['uuid'], $exception->getMessage());
                $errors[] = ['id' => $source['uuid'], 'name' => $source['name'], 'message' => $exception->getMessage()];
            }
        }
        $writable = count(array_filter($sources, static fn (array $source): bool => in_array($source['access_role'], self::WRITABLE_ROLES, true)));
        return [
            'ready' => $sources !== [] && $writable > 0 && $errors === [],
            'activeCalendars' => count($sources), 'writableCalendars' => $writable,
            'synchronizedCalendars' => $synced, 'errors' => $errors, 'verifiedAt' => gmdate('c'),
        ];
    }

    /** @param array<string, mixed> $input @return array<string, mixed> */
    public function createEvent(array $input): array
    {
        $validated = $this->validateInput($input);
        $source = $this->requireWritableSource($validated['calendarId']);
        $response = $this->client->calendar('POST', $this->eventsPath($source), $this->oauth->accessToken(), [], $this->eventPayload($validated));
        $event = $this->mapEvent($source, $response);
        $this->repository->upsertEvent($event);
        return $this->presentEvent($this->repository->findEvent($event['uuid'])
            ?? throw new AppException('GOOGLE_INVALID_RESPONSE', 'Der Google-Termin konnte nicht gelesen werden.', 502));
    }

    /** @param array<string, mixed> $input @return array<string, mixed> */
    public function updateEvent(string $uuid, array $input): array
    {
        $existing = $this->repository->findEvent($uuid);
        if ($existing === null) { throw new AppException('NOT_FOUND', 'Der Google-Termin wurde nicht gefunden.', 404); }
        $validated = $this->validateInput($input, $existing);
        if ($validated['calendarId'] !== $existing['source_uuid']) {
            throw new AppException('VALIDATION_ERROR', 'Google-Termine können nicht in einen anderen Kalender verschoben werden.', 422);
        }
        $source = $this->requireWritableSource($existing['source_uuid']);
        $path = $this->eventsPath($source) . '/' . rawurlencode((string) $existing['external_event_id']);
        $response = $this->client->calendar('PATCH', $path, $this->oauth->accessToken(), [], $this->eventPayload($validated));
        $event = $this->mapEvent($source, $response);
        $this->repository->upsertEvent($event);
        return $this->presentEvent($this->repository->findEvent($event['uuid']) ?? throw new AppException('GOOGLE_INVALID_RESPONSE', 'Der Google-Termin konnte nicht gelesen werden.', 502));
    }

    public function deleteEvent(string $uuid): void
    {
        $existing = $this->repository->findEvent($uuid);
        if ($existing === null) { throw new AppException('NOT_FOUND', 'Der Google-Termin wurde nicht gefunden.', 404); }
        $source = $this->requireWritableSource($existing['source_uuid']);
        $path = $this->eventsPath($source) . '/' . rawurlencode((string) $existing['external_event_id']);
        $this->client->calendar('DELETE', $path, $this->oauth->accessToken());
        $this->repository->deleteEvent($uuid);
    }

    public function clear(): void { $this->repository->clearAll(); }

    /** @param array<string, mixed> $source */
    private function synchronizeSource(array $source, ?string $accessToken = null): void
    {
        $token = $accessToken ?? $this->oauth->accessToken();
        $from = gmdate('Y-m-d\TH:i:s\Z', time() - 90 * 86400);
        $to = gmdate('Y-m-d\TH:i:s\Z', time() + 730 * 86400);
        $events = [];
        $pageToken = null;
        do {
            $query = ['timeMin' => $from, 'timeMax' => $to, 'singleEvents' => 'true', 'orderBy' => 'startTime', 'maxResults' => 2500];
            if ($pageToken !== null) { $query['pageToken'] = $pageToken; }
            $response = $this->client->calendar('GET', $this->eventsPath($source), $token, $query);
            foreach (($response['items'] ?? []) as $event) {
                if (!is_array($event) || ($event['status'] ?? '') === 'cancelled') { continue; }
                try { $events[] = $this->mapEvent($source, $event); }
                catch (AppException) { continue; }
            }
            $pageToken = isset($response['nextPageToken']) ? (string) $response['nextPageToken'] : null;
        } while ($pageToken !== null && $pageToken !== '');
        $this->repository->replaceEvents((string) $source['uuid'], $events);
    }

    /** @param array<string, mixed> $source @param array<string, mixed> $event @return array<string, mixed> */
    private function mapEvent(array $source, array $event): array
    {
        $externalId = (string) ($event['id'] ?? '');
        if ($externalId === '') { throw new AppException('GOOGLE_INVALID_RESPONSE', 'Google lieferte einen Termin ohne Kennung.', 502); }
        $allDay = isset($event['start']['date']);
        $timezone = new DateTimeZone($this->repository->householdTimezone());
        try {
            $start = $allDay
                ? new DateTimeImmutable((string) $event['start']['date'] . ' 00:00:00', $timezone)
                : new DateTimeImmutable((string) ($event['start']['dateTime'] ?? ''));
            $end = $allDay
                ? new DateTimeImmutable((string) $event['end']['date'] . ' 00:00:00', $timezone)
                : new DateTimeImmutable((string) ($event['end']['dateTime'] ?? ''));
        } catch (\Throwable) { throw new AppException('GOOGLE_INVALID_RESPONSE', 'Google lieferte ungültige Termindaten.', 502); }
        if ($end <= $start) { throw new AppException('GOOGLE_INVALID_RESPONSE', 'Google lieferte ein ungültiges Terminende.', 502); }
        $now = gmdate('c');
        $title = $this->text((string) ($event['summary'] ?? ''), 140);
        if ($title === '') { $title = '(Ohne Titel)'; }
        return [
            'uuid' => $this->eventUuid((string) $source['uuid'], $externalId), 'source_uuid' => $source['uuid'],
            'external_event_id' => $externalId, 'title' => $title,
            'description' => $this->nullableText($event['description'] ?? null, 2_000),
            'location' => $this->nullableText($event['location'] ?? null, 160),
            'starts_at' => $this->utc($start), 'ends_at' => $this->utc($end), 'all_day' => $allDay ? 1 : 0,
            'is_private' => in_array(strtolower((string) ($event['visibility'] ?? 'default')), ['private', 'confidential'], true) ? 1 : 0,
            'created_at' => $this->googleTime($event['created'] ?? null, $now),
            'updated_at' => $this->googleTime($event['updated'] ?? null, $now),
        ];
    }

    /** @param array<string, mixed> $input @param array<string, mixed>|null $existing @return array<string, mixed> */
    private function validateInput(array $input, ?array $existing = null): array
    {
        $title = trim((string) ($input['title'] ?? $existing['title'] ?? ''));
        if (mb_strlen($title) < 2 || mb_strlen($title) > 140) { throw new AppException('VALIDATION_ERROR', 'Der Titel muss zwischen 2 und 140 Zeichen lang sein.', 422); }
        $calendarId = trim((string) ($input['calendarId'] ?? $existing['source_uuid'] ?? ''));
        $description = $this->nullableText($input['description'] ?? $existing['description'] ?? null, 2_000);
        $location = $this->nullableText($input['location'] ?? $existing['location'] ?? null, 160);
        try {
            $start = new DateTimeImmutable((string) ($input['startsAt'] ?? $existing['starts_at'] ?? ''));
            $end = new DateTimeImmutable((string) ($input['endsAt'] ?? $existing['ends_at'] ?? ''));
        } catch (\Throwable) { throw new AppException('VALIDATION_ERROR', 'Beginn oder Ende des Termins ist ungültig.', 422); }
        if ($end <= $start || $end->getTimestamp() - $start->getTimestamp() > 366 * 86400) { throw new AppException('VALIDATION_ERROR', 'Das Terminende ist ungültig.', 422); }
        $allDay = filter_var($input['allDay'] ?? $existing['all_day'] ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        $isPrivate = filter_var($input['isPrivate'] ?? $existing['is_private'] ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($calendarId === '' || $allDay === null) { throw new AppException('VALIDATION_ERROR', 'Die Kalenderauswahl ist ungültig.', 422); }
        if ($isPrivate === null) { throw new AppException('VALIDATION_ERROR', 'Die Privat-Einstellung ist ungültig.', 422); }
        return compact('calendarId', 'title', 'description', 'location', 'start', 'end', 'allDay', 'isPrivate');
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    private function eventPayload(array $data): array
    {
        if ($data['allDay']) {
            $timezone = new DateTimeZone($this->repository->householdTimezone());
            $start = ['date' => $data['start']->setTimezone($timezone)->format('Y-m-d')];
            $end = ['date' => $data['end']->setTimezone($timezone)->format('Y-m-d')];
        } else {
            $start = ['dateTime' => $this->utc($data['start'])];
            $end = ['dateTime' => $this->utc($data['end'])];
        }
        return ['summary' => $data['title'], 'description' => $data['description'] ?? '', 'location' => $data['location'] ?? '', 'visibility' => $data['isPrivate'] ? 'private' : 'default', 'start' => $start, 'end' => $end];
    }

    /** @param array<string, mixed> $source */
    private function eventsPath(array $source): string
    {
        return 'calendars/' . rawurlencode($this->cipher->decrypt((string) $source['external_id_encrypted'])) . '/events';
    }

    /** @return array<string, mixed> */
    private function requireSource(string $uuid): array
    {
        return $this->repository->findSource($uuid) ?? throw new AppException('NOT_FOUND', 'Der Google-Kalender wurde nicht gefunden.', 404);
    }

    /** @return array<string, mixed> */
    private function requireWritableSource(string $uuid): array
    {
        $source = $this->requireSource($uuid);
        if (!(bool) $source['is_active'] || !in_array($source['access_role'], self::WRITABLE_ROLES, true)) {
            throw new AppException('GOOGLE_CALENDAR_READ_ONLY', 'Dieser Google-Kalender ist nur lesbar.', 403);
        }
        return $source;
    }

    /** @param array<string, mixed> $source @return array<string, mixed> */
    private function presentSource(array $source): array
    {
        return [
            'id' => $source['uuid'], 'name' => $source['name'], 'color' => $source['color'],
            'accessRole' => $source['access_role'], 'writable' => in_array($source['access_role'], self::WRITABLE_ROLES, true),
            'isPrimary' => (bool) $source['is_primary'], 'isActive' => (bool) $source['is_active'],
            'lastSyncedAt' => $source['last_synced_at'], 'lastSyncStatus' => $source['last_sync_status'],
            'lastSyncMessage' => $source['last_sync_message'],
        ];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function presentEvent(array $row): array
    {
        return [
            'id' => $row['uuid'], 'calendar' => ['id' => $row['source_uuid'], 'name' => $row['calendar_name'], 'color' => $row['calendar_color']],
            'title' => $row['title'], 'description' => $row['description'], 'location' => $row['location'],
            'startsAt' => $row['starts_at'], 'endsAt' => $row['ends_at'], 'allDay' => (bool) $row['all_day'],
            'isPrivate' => (bool) ($row['is_private'] ?? false),
            'createdBy' => null, 'source' => 'GOOGLE', 'editable' => in_array($row['access_role'], self::WRITABLE_ROLES, true),
            'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at'],
        ];
    }

    private function text(string $value, int $max): string { return mb_substr(trim($value), 0, $max); }
    private function nullableText(mixed $value, int $max): ?string { $text = $this->text((string) ($value ?? ''), $max); return $text === '' ? null : $text; }
    private function utc(DateTimeImmutable $date): string { return $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z'); }
    private function googleTime(mixed $value, string $fallback): string { try { return $this->utc(new DateTimeImmutable((string) $value)); } catch (\Throwable) { return $fallback; } }
    private function eventUuid(string $sourceUuid, string $eventId): string { return $this->uuidFrom(hash('sha256', $sourceUuid . ':' . $eventId)); }
    private function uuid(): string { return $this->uuidFrom(bin2hex(random_bytes(16))); }
    private function uuidFrom(string $hex): string { $hex = substr($hex, 0, 32); return sprintf('%s-%s-4%s-a%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 13, 3), substr($hex, 17, 3), substr($hex, 20, 12)); }
}
