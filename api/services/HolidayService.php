<?php
declare(strict_types=1);

namespace FamilyHub\Services;

use DateTimeImmutable;
use FamilyHub\Core\AppException;
use FamilyHub\Repositories\HolidayRepository;

final class HolidayService
{
    public const REGIONS = [
        'DE-BW' => 'Baden-Württemberg', 'DE-BY' => 'Bayern', 'DE-BE' => 'Berlin', 'DE-BB' => 'Brandenburg',
        'DE-HB' => 'Bremen', 'DE-HH' => 'Hamburg', 'DE-HE' => 'Hessen', 'DE-MV' => 'Mecklenburg-Vorpommern',
        'DE-NI' => 'Niedersachsen', 'DE-NW' => 'Nordrhein-Westfalen', 'DE-RP' => 'Rheinland-Pfalz', 'DE-SL' => 'Saarland',
        'DE-SN' => 'Sachsen', 'DE-ST' => 'Sachsen-Anhalt', 'DE-SH' => 'Schleswig-Holstein', 'DE-TH' => 'Thüringen',
    ];

    public function __construct(private HolidayRepository $repository, private OpenHolidaysClient $client) {}

    public function status(): array
    {
        $settings = $this->repository->settings();
        return [
            'configured' => $settings !== null,
            'countryCode' => 'DE',
            'subdivisionCode' => $settings['subdivision_code'] ?? null,
            'regionName' => isset($settings['subdivision_code']) ? (self::REGIONS[$settings['subdivision_code']] ?? $settings['subdivision_code']) : null,
            'publicEnabled' => (bool) ($settings['public_enabled'] ?? true),
            'schoolEnabled' => (bool) ($settings['school_enabled'] ?? true),
            'regions' => array_map(static fn (string $code, string $name): array => ['code' => $code, 'name' => $name], array_keys(self::REGIONS), self::REGIONS),
            'nextEvents' => $settings === null ? [] : $this->repository->nextEvents(),
            'attributionUrl' => 'https://www.openholidaysapi.org/',
        ];
    }

    public function preview(array $input): array
    {
        [$subdivision, $public, $school] = $this->validate($input);
        $from = (new DateTimeImmutable('today'))->format('Y-m-d');
        $to = (new DateTimeImmutable('today'))->modify('+12 months')->format('Y-m-d');
        $datasets = $this->fetch($subdivision, $public, $school, $from, $to);
        return ['subdivisionCode' => $subdivision, 'regionName' => self::REGIONS[$subdivision], 'from' => $from, 'to' => $to, 'public' => array_slice($datasets['PUBLIC'] ?? [], 0, 8), 'school' => array_slice($datasets['SCHOOL'] ?? [], 0, 8)];
    }

    /** @param array{id: string} $actor */
    public function configure(array $input, array $actor): array
    {
        [$subdivision, $public, $school] = $this->validate($input);
        $this->sync($subdivision, $public, $school, $actor['id']);
        return $this->status();
    }

    public function synchronize(): array
    {
        $settings = $this->repository->settings();
        if ($settings === null) { throw new AppException('HOLIDAY_NOT_CONFIGURED', 'Ferien und Feiertage sind noch nicht eingerichtet.', 409); }
        $this->sync((string) $settings['subdivision_code'], (bool) $settings['public_enabled'], (bool) $settings['school_enabled'], (string) $settings['created_by_member_uuid']);
        return $this->status();
    }

    public function synchronizeStale(): void
    {
        if (!$this->repository->isStale(gmdate('c', time() - 86_400))) { return; }
        try { $this->synchronize(); }
        catch (\Throwable $error) { $this->repository->markError($error instanceof AppException ? $error->getMessage() : 'Die Aktualisierung ist fehlgeschlagen. Vorhandene Daten bleiben erhalten.'); }
    }

    public function remove(): void { $this->repository->remove(); }

    /** @return array{0: string, 1: bool, 2: bool} */
    private function validate(array $input): array
    {
        $subdivision = strtoupper(trim((string) ($input['subdivisionCode'] ?? '')));
        if (!isset(self::REGIONS[$subdivision])) { throw new AppException('VALIDATION_ERROR', 'Bitte ein gültiges Bundesland auswählen.', 422); }
        $public = filter_var($input['publicEnabled'] ?? true, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        $school = filter_var($input['schoolEnabled'] ?? true, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($public === null || $school === null || (!$public && !$school)) { throw new AppException('VALIDATION_ERROR', 'Wähle mindestens Feiertage oder Schulferien aus.', 422); }
        return [$subdivision, $public, $school];
    }

    private function sync(string $subdivision, bool $public, bool $school, string $actorId): void
    {
        $from = (new DateTimeImmutable('today'))->modify('-90 days')->format('Y-m-d');
        $to = (new DateTimeImmutable('today'))->modify('+730 days')->format('Y-m-d');
        $datasets = $this->fetch($subdivision, $public, $school, $from, $to);
        $this->repository->save($subdivision, self::REGIONS[$subdivision], $public, $school, $actorId, $datasets, $from, $to);
    }

    /** @return array{PUBLIC?: list<array<string, mixed>>, SCHOOL?: list<array<string, mixed>>} */
    private function fetch(string $subdivision, bool $public, bool $school, string $from, string $to): array
    {
        $datasets = [];
        if ($public) { $datasets['PUBLIC'] = $this->client->fetch('PUBLIC', $subdivision, $from, $to); }
        if ($school) { $datasets['SCHOOL'] = $this->client->fetch('SCHOOL', $subdivision, $from, $to); }
        return $datasets;
    }
}

