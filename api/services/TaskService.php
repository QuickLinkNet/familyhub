<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use FamilyCompass\Core\AppException;
use FamilyCompass\Models\Task;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\TaskRepository;

final class TaskService
{
    private const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

    public function __construct(private TaskRepository $tasks, private FamilyMemberRepository $members) {}

    /** @return list<array<string, mixed>> */
    public function list(): array { return array_map(static fn (Task $task): array => $task->toArray(), $this->tasks->all()); }

    /** @param array<string, mixed> $input */
    public function create(array $input): array
    {
        $data = $this->validate($input);
        $now = gmdate('c');
        return $this->tasks->create($data + ['uuid' => $this->uuid(), 'status' => 'OPEN', 'created_at' => $now, 'updated_at' => $now])->toArray();
    }

    /** @param array<string, mixed> $input */
    public function update(string $uuid, array $input): array
    {
        $existing = $this->tasks->find($uuid);
        if ($existing === null) { throw new AppException('NOT_FOUND', 'Die Aufgabe wurde nicht gefunden.', 404); }
        return $this->tasks->update($uuid, $this->validate($input, $existing) + ['updated_at' => gmdate('c')])->toArray();
    }

    public function complete(string $uuid): array
    {
        $task = $this->tasks->find($uuid);
        if ($task === null) { throw new AppException('NOT_FOUND', 'Die Aufgabe wurde nicht gefunden.', 404); }
        if ($task->status !== 'OPEN') { throw new AppException('CONFLICT', 'Diese Aufgabe wurde bereits abgeschlossen.', 409); }
        $status = $task->requiresVerification ? 'PENDING_VERIFICATION' : 'COMPLETED';
        return ($this->tasks->complete($uuid, $status) ?? throw new AppException('CONFLICT', 'Die Aufgabe konnte nicht abgeschlossen werden.', 409))->toArray();
    }

    public function delete(string $uuid): void
    {
        if (!$this->tasks->softDelete($uuid)) { throw new AppException('NOT_FOUND', 'Die Aufgabe wurde nicht gefunden.', 404); }
    }

    /** @param array<string, mixed> $input */
    private function validate(array $input, ?Task $existing = null): array
    {
        $title = array_key_exists('title', $input) ? trim((string) $input['title']) : ($existing?->title ?? '');
        if (mb_strlen($title) < 2 || mb_strlen($title) > 140) { throw new AppException('VALIDATION_ERROR', 'Der Titel muss zwischen 2 und 140 Zeichen lang sein.', 422); }
        $description = array_key_exists('description', $input) ? trim((string) $input['description']) : ($existing?->description ?? null);
        if ($description === '') { $description = null; }
        if ($description !== null && mb_strlen($description) > 2_000) { throw new AppException('VALIDATION_ERROR', 'Die Beschreibung darf hÃ¶chstens 2000 Zeichen lang sein.', 422); }
        $memberId = array_key_exists('assignedMemberId', $input) ? $input['assignedMemberId'] : $existing?->assignedMemberId;
        $memberId = $memberId === '' ? null : $memberId;
        if ($memberId !== null && (!is_string($memberId) || $this->members->find($memberId) === null)) { throw new AppException('VALIDATION_ERROR', 'Das zugeordnete Familienmitglied wurde nicht gefunden.', 422); }
        $dueDate = array_key_exists('dueDate', $input) ? $input['dueDate'] : $existing?->dueDate;
        $dueDate = $dueDate === '' ? null : $dueDate;
        if ($dueDate !== null && (!is_string($dueDate) || !$this->validDate($dueDate))) { throw new AppException('VALIDATION_ERROR', 'Das FÃ¤lligkeitsdatum ist ungÃ¼ltig.', 422); }
        $priority = array_key_exists('priority', $input) ? strtoupper((string) $input['priority']) : ($existing?->priority ?? 'MEDIUM');
        if (!in_array($priority, self::PRIORITIES, true)) { throw new AppException('VALIDATION_ERROR', 'Die PrioritÃ¤t ist ungÃ¼ltig.', 422); }
        $requiresVerification = array_key_exists('requiresVerification', $input) ? filter_var($input['requiresVerification'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : ($existing?->requiresVerification ?? false);
        if ($requiresVerification === null) { throw new AppException('VALIDATION_ERROR', 'Die BestÃ¤tigungs-Einstellung ist ungÃ¼ltig.', 422); }
        return ['title' => $title, 'description' => $description, 'assigned_member_uuid' => $memberId, 'due_date' => $dueDate, 'priority' => $priority, 'requires_verification' => $requiresVerification ? 1 : 0];
    }

    private function validDate(string $date): bool
    {
        $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        return $parsed !== false && $parsed->format('Y-m-d') === $date;
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes); return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
