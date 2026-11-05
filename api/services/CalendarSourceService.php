<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use DateTimeZone;
use FamilyCompass\Core\AppException;
use FamilyCompass\Core\CalendarSourceCipher;
use FamilyCompass\Repositories\CalendarSourceRepository;

final class CalendarSourceService
{
    public function __construct(
        private CalendarSourceRepository $repository,
        private CalendarSourceCipher $cipher,
        private IcalFetcher $fetcher,
        private IcalParser $parser
    ) {}

    /** @return list<array<string, mixed>> */
    public function all(): array
    {
        return array_map(fn (array $source): array => $this->present($source), $this->repository->all());
    }

    /** @param array<string, mixed> $input @param array{id: string} $actor */
    public function create(array $input, array $actor): array
    {
        $validated = $this->validate($input);
        $now = gmdate('c');
        $source = $this->repository->create([
            'uuid' => $this->uuid(),
            'name' => $validated['name'],
            'provider' => 'GOOGLE_ICAL',
            'source_url_encrypted' => $this->cipher->encrypt($validated['url']),
            'color' => $validated['color'],
            'is_active' => $validated['is_active'],
            'last_sync_status' => 'NEVER',
            'created_by_member_uuid' => $actor['id'],
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        return $this->synchronize($source['uuid']);
    }

    /** @param array<string, mixed> $input */
    public function update(string $uuid, array $input): array
    {
        $existing = $this->requireSource($uuid);
        $validated = $this->validate($input, $existing);
        $source = $this->repository->update($uuid, [
            'name' => $validated['name'],
            'source_url_encrypted' => $validated['url'] === null ? $existing['source_url_encrypted'] : $this->cipher->encrypt($validated['url']),
            'color' => $validated['color'],
            'is_active' => $validated['is_active'],
            'updated_at' => gmdate('c'),
        ]);
        return $validated['url'] === null ? $this->present($source) : $this->synchronize($uuid);
    }

    public function synchronize(string $uuid): array
    {
        $source = $this->requireSource($uuid);
        try {
            $url = $this->cipher->decrypt($source['source_url_encrypted']);
            $content = $this->fetcher->fetch($url);
            $timezone = new DateTimeZone($this->repository->householdTimezone());
            $windowStart = (new DateTimeImmutable('now', $timezone))->modify('-90 days')->setTime(0, 0);
            $windowEnd = (new DateTimeImmutable('now', $timezone))->modify('+730 days')->setTime(23, 59, 59);
            $events = $this->parser->parse($content, $windowStart, $windowEnd, $timezone->getName());
            $this->repository->replaceEvents(
                $uuid,
                $events,
                $windowStart->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z'),
                $windowEnd->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z')
            );
        } catch (AppException $error) {
            $this->repository->markSyncError($uuid, $error->getMessage());
        } catch (\Throwable) {
            $this->repository->markSyncError($uuid, 'Der Kalender konnte nicht synchronisiert werden.');
        }
        return $this->present($this->requireSource($uuid));
    }

    public function synchronizeStale(): void
    {
        $before = gmdate('c', time() - 1_800);
        foreach ($this->repository->dueForSync($before) as $source) {
            $this->synchronize((string) $source['uuid']);
        }
    }

    public function delete(string $uuid): void
    {
        if (!$this->repository->delete($uuid)) {
            throw new AppException('NOT_FOUND', 'Die Kalenderquelle wurde nicht gefunden.', 404);
        }
    }

    /** @param array<string, mixed> $input @param array<string, mixed>|null $existing
     *  @return array{name: string, color: string, is_active: int, url: ?string}
     */
    private function validate(array $input, ?array $existing = null): array
    {
        $name = array_key_exists('name', $input) ? trim((string) $input['name']) : (string) ($existing['name'] ?? '');
        if (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
            throw new AppException('VALIDATION_ERROR', 'Der Quellenname muss zwischen 2 und 80 Zeichen lang sein.', 422);
        }
        $color = array_key_exists('color', $input) ? strtoupper(trim((string) $input['color'])) : (string) ($existing['color'] ?? '');
        if (preg_match('/^#[0-9A-F]{6}$/', $color) !== 1) {
            throw new AppException('VALIDATION_ERROR', 'Bitte eine gültige Kalenderfarbe auswählen.', 422);
        }
        $active = array_key_exists('isActive', $input)
            ? filter_var($input['isActive'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : (bool) ($existing['is_active'] ?? true);
        if ($active === null) {
            throw new AppException('VALIDATION_ERROR', 'Die Aktiv-Einstellung ist ungültig.', 422);
        }
        $url = array_key_exists('url', $input) ? $this->fetcher->normaliseGoogleUrl((string) $input['url']) : null;
        if ($existing === null && $url === null) {
            throw new AppException('VALIDATION_ERROR', 'Die Google-iCal-Adresse ist erforderlich.', 422);
        }
        return ['name' => $name, 'color' => $color, 'is_active' => $active ? 1 : 0, 'url' => $url];
    }

    /** @return array<string, mixed> */
    private function requireSource(string $uuid): array
    {
        $source = $this->repository->find($uuid);
        if ($source === null) {
            throw new AppException('NOT_FOUND', 'Die Kalenderquelle wurde nicht gefunden.', 404);
        }
        return $source;
    }

    /** @param array<string, mixed> $source @return array<string, mixed> */
    private function present(array $source): array
    {
        return [
            'id' => $source['uuid'],
            'name' => $source['name'],
            'provider' => $source['provider'],
            'color' => $source['color'],
            'isActive' => (bool) $source['is_active'],
            'urlConfigured' => $source['source_url_encrypted'] !== '',
            'urlHint' => 'calendar.google.com/…/basic.ics',
            'lastSyncedAt' => $source['last_synced_at'],
            'lastSyncStatus' => $source['last_sync_status'],
            'lastSyncMessage' => $source['last_sync_message'],
            'syncWindowStart' => $source['sync_window_start'],
            'syncWindowEnd' => $source['sync_window_end'],
        ];
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
