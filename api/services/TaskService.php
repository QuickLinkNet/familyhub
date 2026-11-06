<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use DateTimeZone;
use FamilyCompass\Core\AppException;
use FamilyCompass\Models\Task;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\TaskRepository;

final class TaskService
{
    private const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
    private const ROUTINE_PERIODS = ['MORNING', 'AFTERNOON', 'EVENING'];

    public function __construct(private TaskRepository $tasks, private FamilyMemberRepository $members) {}

    /** @return list<array<string, mixed>> */
    public function list(): array
    {
        return array_map(static fn (Task $task): array => $task->toArray(), $this->tasks->all());
    }

    /** @param array<string, mixed> $input */
    public function create(array $input): array
    {
        $data = $this->validate($input);
        $now = gmdate('c');
        $uuid = $this->uuid();
        return $this->tasks->create($data + [
            'uuid' => $uuid,
            'series_uuid' => $data['repeat_days'] === null ? null : $uuid,
            'status' => 'OPEN',
            'created_at' => $now,
            'updated_at' => $now,
        ])->toArray();
    }

    /** @param array<string, mixed> $input */
    public function update(string $uuid, array $input): array
    {
        $existing = $this->tasks->find($uuid);
        if ($existing === null) {
            throw new AppException('NOT_FOUND', 'Die Aufgabe wurde nicht gefunden.', 404);
        }
        if ($existing->status !== 'OPEN') {
            throw new AppException('CONFLICT', 'Nur offene Aufgaben können bearbeitet werden.', 409);
        }
        return $this->tasks->update($uuid, $this->validate($input, $existing) + ['updated_at' => gmdate('c')])->toArray();
    }

    /** @param array{id: string, name: string, color: string, role: string} $actor */
    public function complete(string $uuid, array $actor): array
    {
        $task = $this->requireTask($uuid);
        if ($actor['role'] === 'CHILD' && $task->assignedMemberId !== $actor['id']) {
            throw new AppException('FORBIDDEN', 'Kinder können nur eigene Aufgaben abschließen.', 403);
        }
        if ($task->status !== 'OPEN') {
            throw new AppException('CONFLICT', 'Diese Aufgabe wurde bereits abgeschlossen.', 409);
        }
        $status = $task->requiresVerification ? 'PENDING_VERIFICATION' : 'COMPLETED';
        $nextTask = $status === 'COMPLETED' ? $this->nextOccurrence($task) : null;
        return ($this->tasks->transition($uuid, 'OPEN', $status, $nextTask)
            ?? throw new AppException('CONFLICT', 'Die Aufgabe konnte nicht abgeschlossen werden.', 409))->toArray();
    }

    public function verify(string $uuid): array
    {
        $task = $this->requireTask($uuid);
        if ($task->status !== 'PENDING_VERIFICATION') {
            throw new AppException('CONFLICT', 'Diese Aufgabe wartet nicht auf eine Elternprüfung.', 409);
        }
        return ($this->tasks->transition($uuid, 'PENDING_VERIFICATION', 'COMPLETED', $this->nextOccurrence($task))
            ?? throw new AppException('CONFLICT', 'Die Aufgabe konnte nicht bestätigt werden.', 409))->toArray();
    }

    public function delete(string $uuid): void
    {
        if (!$this->tasks->softDelete($uuid)) {
            throw new AppException('NOT_FOUND', 'Die Aufgabe wurde nicht gefunden.', 404);
        }
    }

    /** @param array<string, mixed> $input @return array<string, mixed> */
    private function validate(array $input, ?Task $existing = null): array
    {
        $title = array_key_exists('title', $input) ? trim((string) $input['title']) : ($existing?->title ?? '');
        if (mb_strlen($title) < 2 || mb_strlen($title) > 140) {
            throw new AppException('VALIDATION_ERROR', 'Der Titel muss zwischen 2 und 140 Zeichen lang sein.', 422);
        }

        $description = array_key_exists('description', $input) ? trim((string) $input['description']) : ($existing?->description ?? null);
        $description = $description === '' ? null : $description;
        if ($description !== null && mb_strlen($description) > 2_000) {
            throw new AppException('VALIDATION_ERROR', 'Die Beschreibung darf höchstens 2000 Zeichen lang sein.', 422);
        }

        $memberId = array_key_exists('assignedMemberId', $input) ? $input['assignedMemberId'] : $existing?->assignedMemberId;
        $memberId = $memberId === '' ? null : $memberId;
        if ($memberId !== null && (!is_string($memberId) || $this->members->find($memberId) === null)) {
            throw new AppException('VALIDATION_ERROR', 'Das zugeordnete Familienmitglied wurde nicht gefunden.', 422);
        }

        $dueDate = array_key_exists('dueDate', $input) ? $input['dueDate'] : $existing?->dueDate;
        $dueDate = $dueDate === '' ? null : $dueDate;
        if ($dueDate !== null && (!is_string($dueDate) || !$this->validDate($dueDate))) {
            throw new AppException('VALIDATION_ERROR', 'Das Fälligkeitsdatum ist ungültig.', 422);
        }

        $priority = array_key_exists('priority', $input) ? strtoupper((string) $input['priority']) : ($existing?->priority ?? 'MEDIUM');
        if (!in_array($priority, self::PRIORITIES, true)) {
            throw new AppException('VALIDATION_ERROR', 'Die Priorität ist ungültig.', 422);
        }

        $requiresVerification = array_key_exists('requiresVerification', $input)
            ? filter_var($input['requiresVerification'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : ($existing?->requiresVerification ?? false);
        if ($requiresVerification === null) {
            throw new AppException('VALIDATION_ERROR', 'Die Bestätigungs-Einstellung ist ungültig.', 422);
        }

        $routinePeriod = array_key_exists('routinePeriod', $input) ? $input['routinePeriod'] : $existing?->routinePeriod;
        $routinePeriod = $routinePeriod === '' ? null : $routinePeriod;
        if ($routinePeriod !== null && (!is_string($routinePeriod) || !in_array($routinePeriod, self::ROUTINE_PERIODS, true))) {
            throw new AppException('VALIDATION_ERROR', 'Der Routine-Zeitraum ist ungültig.', 422);
        }

        $repeatDays = array_key_exists('repeatDays', $input) ? $this->repeatDays($input['repeatDays']) : ($existing?->repeatDays ?? []);
        if ($routinePeriod !== null && $repeatDays === []) {
            throw new AppException('VALIDATION_ERROR', 'Eine Routine benötigt mindestens einen Wochentag.', 422);
        }
        if ($routinePeriod === null && $repeatDays !== [] && !array_key_exists('routinePeriod', $input) && $existing === null) {
            $routinePeriod = null;
        }
        if ($repeatDays !== []) {
            $start = new DateTimeImmutable($dueDate ?? 'today', $this->timezone());
            $dueDate = $this->selectedDateOnOrAfter($start, $repeatDays)->format('Y-m-d');
        }

        return [
            'title' => $title,
            'description' => $description,
            'assigned_member_uuid' => $memberId,
            'due_date' => $dueDate,
            'priority' => $priority,
            'requires_verification' => $requiresVerification ? 1 : 0,
            'routine_period' => $routinePeriod,
            'repeat_days' => $repeatDays === [] ? null : json_encode($repeatDays, JSON_THROW_ON_ERROR),
        ];
    }

    /** @return list<int> */
    private function repeatDays(mixed $value): array
    {
        if ($value === null || $value === '') { return []; }
        if (!is_array($value) || count($value) > 7) {
            throw new AppException('VALIDATION_ERROR', 'Die Wiederholungstage sind ungültig.', 422);
        }
        $days = array_values(array_unique(array_map(static fn (mixed $day): int => (int) $day, $value)));
        sort($days);
        foreach ($days as $day) {
            if ($day < 1 || $day > 7) {
                throw new AppException('VALIDATION_ERROR', 'Die Wiederholungstage sind ungültig.', 422);
            }
        }
        return $days;
    }

    /** @return array<string, mixed>|null */
    private function nextOccurrence(Task $task): ?array
    {
        if ($task->repeatDays === []) { return null; }
        $today = new DateTimeImmutable('today', $this->timezone());
        $reference = $task->dueDate === null ? $today : new DateTimeImmutable($task->dueDate, $this->timezone());
        if ($reference < $today) { $reference = $today; }
        $nextDate = $this->selectedDateOnOrAfter($reference->modify('+1 day'), $task->repeatDays);
        $now = gmdate('c');
        return [
            'uuid' => $this->uuid(),
            'title' => $task->title,
            'description' => $task->description,
            'assigned_member_uuid' => $task->assignedMemberId,
            'due_date' => $nextDate->format('Y-m-d'),
            'priority' => $task->priority,
            'status' => 'OPEN',
            'requires_verification' => $task->requiresVerification ? 1 : 0,
            'routine_period' => $task->routinePeriod,
            'repeat_days' => json_encode($task->repeatDays, JSON_THROW_ON_ERROR),
            'series_uuid' => $task->seriesId ?? $task->uuid,
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    /** @param list<int> $days */
    private function selectedDateOnOrAfter(DateTimeImmutable $date, array $days): DateTimeImmutable
    {
        for ($offset = 0; $offset < 7; $offset += 1) {
            $candidate = $date->modify("+{$offset} days");
            if (in_array((int) $candidate->format('N'), $days, true)) { return $candidate; }
        }
        throw new AppException('VALIDATION_ERROR', 'Für die Routine wurde kein gültiger Wochentag gefunden.', 422);
    }

    private function requireTask(string $uuid): Task
    {
        return $this->tasks->find($uuid) ?? throw new AppException('NOT_FOUND', 'Die Aufgabe wurde nicht gefunden.', 404);
    }

    private function timezone(): DateTimeZone
    {
        try { return new DateTimeZone($this->tasks->householdTimezone()); }
        catch (\Throwable) { return new DateTimeZone('Europe/Berlin'); }
    }

    private function validDate(string $date): bool
    {
        $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        return $parsed !== false && $parsed->format('Y-m-d') === $date;
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
