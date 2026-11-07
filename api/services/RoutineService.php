<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use DateTimeZone;
use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\RoutineRepository;

final class RoutineService
{
    private const PERIODS = ['MORNING', 'AFTERNOON', 'EVENING'];

    public function __construct(private RoutineRepository $routines, private FamilyMemberRepository $members) {}

    /** @return array<string, mixed> */
    public function overview(): array
    {
        $today = new DateTimeImmutable('today', $this->timezone());
        $date = $today->format('Y-m-d');
        $weekday = (int) $today->format('N');
        foreach ($this->routines->templates(true) as $template) {
            if (in_array($weekday, $template['repeatDays'], true)) {
                $this->routines->materialize($template, $date, $this->uuid(), array_map(fn (): string => $this->uuid(), $template['steps']));
            }
        }
        return ['date' => $date, 'runs' => $this->routines->runsForDate($date), 'templates' => $this->routines->templates()];
    }

    /** @param array<string, mixed> $input */
    public function create(array $input): array
    {
        [$data, $steps] = $this->validate($input);
        $now = gmdate('c');
        $this->routines->createTemplate($data + ['uuid' => $this->uuid(), 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now], $this->stepRows($steps, $now));
        return $this->overview();
    }

    /** @param array<string, mixed> $input */
    public function update(string $uuid, array $input): array
    {
        $existing = $this->routines->findTemplate($uuid) ?? throw new AppException('NOT_FOUND', 'Die Routine wurde nicht gefunden.', 404);
        [$data, $steps] = $this->validate($input, $existing);
        $active = array_key_exists('isActive', $input)
            ? filter_var($input['isActive'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : $existing['isActive'];
        if ($active === null) { throw new AppException('VALIDATION_ERROR', 'Der Aktiv-Status ist ungültig.', 422); }
        $now = gmdate('c');
        if (!$this->routines->updateTemplate($uuid, $data + ['is_active' => $active ? 1 : 0, 'updated_at' => $now], $this->stepRows($steps, $now))) {
            throw new AppException('NOT_FOUND', 'Die Routine wurde nicht gefunden.', 404);
        }
        return $this->overview();
    }

    public function delete(string $uuid): void
    {
        if (!$this->routines->softDeleteTemplate($uuid)) { throw new AppException('NOT_FOUND', 'Die Routine wurde nicht gefunden.', 404); }
    }

    /** @param array{id: string, role: string} $actor @return array<string, mixed> */
    public function completeStep(string $runUuid, string $stepUuid, array $actor): array
    {
        $run = $this->routines->findRun($runUuid) ?? throw new AppException('NOT_FOUND', 'Die Routine wurde nicht gefunden.', 404);
        if ($actor['role'] === 'CHILD' && $run['assignedMember']['id'] !== $actor['id']) {
            throw new AppException('FORBIDDEN', 'Kinder können nur ihre eigene Routine erledigen.', 403);
        }
        if ($run['status'] === 'COMPLETED') { throw new AppException('CONFLICT', 'Diese Routine ist bereits vollständig erledigt.', 409); }
        if (!$this->routines->completeStep($runUuid, $stepUuid, $actor['id'])) {
            throw new AppException('CONFLICT', 'Dieser Schritt wurde bereits erledigt oder nicht gefunden.', 409);
        }
        return $this->routines->findRun($runUuid) ?? throw new AppException('NOT_FOUND', 'Die Routine wurde nicht gefunden.', 404);
    }

    /** @param array<string, mixed> $input @param array<string, mixed>|null $existing @return array{0: array<string, mixed>, 1: list<string>} */
    private function validate(array $input, ?array $existing = null): array
    {
        $title = array_key_exists('title', $input) ? trim((string) $input['title']) : (string) ($existing['title'] ?? '');
        $description = array_key_exists('description', $input) ? trim((string) $input['description']) : ($existing['description'] ?? null);
        $description = $description === '' ? null : $description;
        if (mb_strlen($title) < 2 || mb_strlen($title) > 100 || ($description !== null && mb_strlen($description) > 1000)) {
            throw new AppException('VALIDATION_ERROR', 'Titel oder Beschreibung der Routine ist ungültig.', 422);
        }

        $memberId = array_key_exists('assignedMemberId', $input) ? trim((string) $input['assignedMemberId']) : (string) ($existing['assignedMember']['id'] ?? '');
        if ($memberId === '' || $this->members->find($memberId) === null) {
            throw new AppException('VALIDATION_ERROR', 'Bitte ordne die Routine einem Familienmitglied zu.', 422);
        }

        $period = array_key_exists('routinePeriod', $input) ? strtoupper((string) $input['routinePeriod']) : (string) ($existing['routinePeriod'] ?? '');
        if (!in_array($period, self::PERIODS, true)) { throw new AppException('VALIDATION_ERROR', 'Die Tageszeit ist ungültig.', 422); }

        $repeatDays = array_key_exists('repeatDays', $input) ? $this->repeatDays($input['repeatDays']) : ($existing['repeatDays'] ?? []);
        $rawSteps = array_key_exists('steps', $input) ? $input['steps'] : array_column($existing['steps'] ?? [], 'title');
        if (!is_array($rawSteps) || count($rawSteps) < 2 || count($rawSteps) > 12) {
            throw new AppException('VALIDATION_ERROR', 'Eine Routine benötigt 2 bis 12 Schritte.', 422);
        }
        $steps = array_map(static fn (mixed $step): string => trim(is_array($step) ? (string) ($step['title'] ?? '') : (string) $step), array_values($rawSteps));
        foreach ($steps as $step) {
            if (mb_strlen($step) < 2 || mb_strlen($step) > 100) { throw new AppException('VALIDATION_ERROR', 'Jeder Routineschritt benötigt 2 bis 100 Zeichen.', 422); }
        }

        return [[
            'title' => $title,
            'description' => $description,
            'assigned_member_uuid' => $memberId,
            'routine_period' => $period,
            'repeat_days' => json_encode($repeatDays, JSON_THROW_ON_ERROR),
        ], $steps];
    }

    /** @return list<int> */
    private function repeatDays(mixed $value): array
    {
        if (!is_array($value) || $value === [] || count($value) > 7) { throw new AppException('VALIDATION_ERROR', 'Bitte wähle mindestens einen gültigen Wochentag.', 422); }
        $days = array_values(array_unique(array_map(static fn (mixed $day): int => (int) $day, $value)));
        sort($days);
        foreach ($days as $day) { if ($day < 1 || $day > 7) { throw new AppException('VALIDATION_ERROR', 'Die Wiederholungstage sind ungültig.', 422); } }
        return $days;
    }

    /** @param list<string> $steps @return list<array<string, mixed>> */
    private function stepRows(array $steps, string $now): array
    {
        return array_map(fn (string $title, int $position): array => ['uuid' => $this->uuid(), 'title' => $title, 'position' => $position, 'created_at' => $now, 'updated_at' => $now], $steps, array_keys($steps));
    }

    private function timezone(): DateTimeZone
    {
        try { return new DateTimeZone($this->routines->householdTimezone()); }
        catch (\Throwable) { return new DateTimeZone('Europe/Berlin'); }
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
