<?php
declare(strict_types=1);

namespace FamilyHub\Services;

use DateTimeImmutable;
use DateTimeZone;
use FamilyHub\Core\AppException;
use FamilyHub\Repositories\ProfilePreferenceRepository;

final class ProfilePreferenceService
{
    private const DASHBOARD_CARDS = ['REMINDERS', 'TODAY', 'TASKS', 'FAMILY', 'REWARDS', 'SHOPPING', 'MEALS', 'NOTES', 'SCHOOL', 'HOUSEHOLD', 'GOALS', 'WALL_MODE', 'ADMIN_SETUP'];
    private const WALL_CARDS = ['EVENTS', 'TASKS', 'REMINDERS', 'GOALS', 'NOTES', 'SCHOOL', 'FAMILY'];
    private const CALENDAR_VIEWS = ['DAY', 'TIMELINE', 'FIVE_DAY', 'WEEK', 'MONTH'];

    public function __construct(private ProfilePreferenceRepository $repository) {}

    /** @param array{id: string} $actor @return array<string, mixed> */
    public function show(array $actor): array
    {
        return $this->map($this->repository->find($actor['id']));
    }

    /** @param array{id: string} $actor @param array<string, mixed> $input @return array<string, mixed> */
    public function update(array $actor, array $input): array
    {
        $current = $this->show($actor);
        $dashboard = $this->cards($input['dashboardCards'] ?? $current['dashboardCards'], self::DASHBOARD_CARDS, 'Übersicht');
        $wall = $this->cards($input['wallCards'] ?? $current['wallCards'], self::WALL_CARDS, 'Wandmodus');
        $enabled = array_key_exists('quietHoursEnabled', $input)
            ? filter_var($input['quietHoursEnabled'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : $current['quietHoursEnabled'];
        if ($enabled === null) { throw new AppException('VALIDATION_ERROR', 'Die Ruhezeit-Aktivierung ist ungültig.', 422); }
        $start = $this->time($input['quietHoursStart'] ?? $current['quietHoursStart'], 'Beginn');
        $end = $this->time($input['quietHoursEnd'] ?? $current['quietHoursEnd'], 'Ende');
        if ($start === $end) { throw new AppException('VALIDATION_ERROR', 'Beginn und Ende der Ruhezeit müssen unterschiedlich sein.', 422); }
        $calendarView = strtoupper(trim((string) ($input['calendarView'] ?? $current['calendarView'])));
        if (!in_array($calendarView, self::CALENDAR_VIEWS, true)) {
            throw new AppException('VALIDATION_ERROR', 'Die Standardansicht des Kalenders ist ungültig.', 422);
        }
        $calendarMemberIds = $this->filterIds($input['calendarMemberIds'] ?? $current['calendarMemberIds'], 12, 'Personenfilter');
        $calendarIds = $this->filterIds($input['calendarIds'] ?? $current['calendarIds'], 32, 'Kalenderfilter');
        $now = gmdate('c');
        $this->repository->save([
            'member_uuid' => $actor['id'],
            'dashboard_cards_json' => json_encode($dashboard, JSON_THROW_ON_ERROR),
            'wall_cards_json' => json_encode($wall, JSON_THROW_ON_ERROR),
            'quiet_hours_enabled' => $enabled ? 1 : 0,
            'quiet_hours_start' => $start,
            'quiet_hours_end' => $end,
            'calendar_view' => $calendarView,
            'calendar_member_ids_json' => json_encode($calendarMemberIds, JSON_THROW_ON_ERROR),
            'calendar_ids_json' => json_encode($calendarIds, JSON_THROW_ON_ERROR),
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        return $this->show($actor);
    }

    public function quietHoursActive(string $memberId, ?DateTimeImmutable $reference = null): bool
    {
        $preferences = $this->map($this->repository->find($memberId));
        if (!$preferences['quietHoursEnabled']) { return false; }
        try { $timezone = new DateTimeZone($this->repository->householdTimezone()); }
        catch (\Throwable) { $timezone = new DateTimeZone('Europe/Berlin'); }
        $time = ($reference ?? new DateTimeImmutable('now', $timezone))->setTimezone($timezone)->format('H:i');
        $start = $preferences['quietHoursStart'];
        $end = $preferences['quietHoursEnd'];
        return $start < $end ? $time >= $start && $time < $end : $time >= $start || $time < $end;
    }

    /** @param mixed $value @param list<string> $allowed @return list<string> */
    private function cards(mixed $value, array $allowed, string $label): array
    {
        if (!is_array($value) || $value === []) { throw new AppException('VALIDATION_ERROR', "$label muss mindestens eine Karte enthalten.", 422); }
        $cards = array_values(array_unique(array_map(static fn (mixed $item): string => strtoupper(trim((string) $item)), $value)));
        if (count($cards) > count($allowed) || array_diff($cards, $allowed) !== []) {
            throw new AppException('VALIDATION_ERROR', "$label enthält eine unbekannte Karte.", 422);
        }
        return $cards;
    }

    private function time(mixed $value, string $label): string
    {
        $time = trim((string) $value);
        if (preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time) !== 1) {
            throw new AppException('VALIDATION_ERROR', "$label der Ruhezeit ist ungültig.", 422);
        }
        return $time;
    }

    /** @return list<string> */
    private function filterIds(mixed $value, int $maximum, string $label): array
    {
        if (!is_array($value) || count($value) > $maximum) {
            throw new AppException('VALIDATION_ERROR', "$label ist ungültig.", 422);
        }
        $ids = array_values(array_unique(array_map(static fn (mixed $id): string => trim((string) $id), $value)));
        foreach ($ids as $id) {
            if ($id === '' || mb_strlen($id) > 160) {
                throw new AppException('VALIDATION_ERROR', "$label enthält eine ungültige Kennung.", 422);
            }
        }
        return $ids;
    }

    /** @param array<string, mixed>|null $row @return array<string, mixed> */
    private function map(?array $row): array
    {
        return [
            'dashboardCards' => $this->storedCards($row['dashboard_cards_json'] ?? null, self::DASHBOARD_CARDS),
            'wallCards' => $this->storedCards($row['wall_cards_json'] ?? null, self::WALL_CARDS),
            'quietHoursEnabled' => (int) ($row['quiet_hours_enabled'] ?? 0) === 1,
            'quietHoursStart' => (string) ($row['quiet_hours_start'] ?? '22:00'),
            'quietHoursEnd' => (string) ($row['quiet_hours_end'] ?? '07:00'),
            'calendarView' => in_array(($row['calendar_view'] ?? null), self::CALENDAR_VIEWS, true) ? $row['calendar_view'] : 'WEEK',
            'calendarMemberIds' => $this->storedFilterIds($row['calendar_member_ids_json'] ?? null, 12),
            'calendarIds' => $this->storedFilterIds($row['calendar_ids_json'] ?? null, 32),
        ];
    }

    /** @param list<string> $fallback @return list<string> */
    private function storedCards(mixed $value, array $fallback): array
    {
        if (!is_string($value) || $value === '') { return $fallback; }
        try { $decoded = json_decode($value, true, 16, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { return $fallback; }
        if (!is_array($decoded) || $decoded === []) { return $fallback; }
        $cards = array_values(array_unique(array_filter(array_map('strval', $decoded), static fn (string $card): bool => in_array($card, $fallback, true))));
        return $cards === [] ? $fallback : $cards;
    }

    /** @return list<string> */
    private function storedFilterIds(mixed $value, int $maximum): array
    {
        if (!is_string($value) || $value === '') { return []; }
        try { $decoded = json_decode($value, true, 16, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { return []; }
        if (!is_array($decoded) || count($decoded) > $maximum) { return []; }
        return array_values(array_unique(array_filter(array_map('strval', $decoded), static fn (string $id): bool => $id !== '' && mb_strlen($id) <= 160)));
    }
}
