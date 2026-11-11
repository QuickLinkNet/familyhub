<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\HouseholdChoreRepository;

final class HouseholdChoreService
{
    private const CATEGORIES = ['CLEANING', 'TRASH', 'PLANTS', 'LAUNDRY', 'PETS', 'OTHER'];
    private const RECURRENCES = ['ONCE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'];

    public function __construct(private HouseholdChoreRepository $chores, private FamilyMemberRepository $members) {}

    /** @return array{chores: list<array<string, mixed>>, completions: list<array<string, mixed>>} */
    public function board(): array { return $this->chores->board(); }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor */
    public function create(array $input, array $actor): array
    {
        $this->requireAdult($actor);
        $now = gmdate('c');
        $this->chores->create($this->validate($input) + ['uuid' => $this->uuid(), 'created_by_member_uuid' => $actor['id'], 'created_at' => $now, 'updated_at' => $now]);
        return $this->board();
    }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor */
    public function update(string $uuid, array $input, array $actor): array
    {
        $this->requireAdult($actor);
        $existing = $this->chores->find($uuid) ?? throw new AppException('NOT_FOUND', 'Die Haushaltsaufgabe wurde nicht gefunden.', 404);
        if (!$existing['isActive']) { throw new AppException('VALIDATION_ERROR', 'Eine abgeschlossene Einzelaufgabe kann nicht mehr bearbeitet werden.', 422); }
        if (!$this->chores->update($uuid, $this->validate($input, $existing) + ['updated_at' => gmdate('c')])) {
            throw new AppException('NOT_FOUND', 'Die Haushaltsaufgabe wurde nicht gefunden.', 404);
        }
        return $this->board();
    }

    /** @param array{id: string, role: string} $actor */
    public function complete(string $uuid, array $actor): array
    {
        $chore = $this->chores->find($uuid) ?? throw new AppException('NOT_FOUND', 'Die Haushaltsaufgabe wurde nicht gefunden.', 404);
        if (!$chore['isActive']) { throw new AppException('VALIDATION_ERROR', 'Diese Haushaltsaufgabe ist bereits erledigt.', 422); }
        if (!in_array($actor['role'], ['ADMIN', 'PARENT'], true) && $chore['assignedMember']['id'] !== $actor['id']) {
            throw new AppException('FORBIDDEN', 'Kinder können nur ihre eigenen Haushaltsaufgaben erledigen.', 403);
        }
        $scheduledDate = (string) $chore['nextDueDate'];
        $completedAt = gmdate('c');
        $nextDueDate = $this->nextDueDate($scheduledDate, (string) $chore['recurrence']);
        if (!$this->chores->complete($uuid, $scheduledDate, $actor['id'], $completedAt, $nextDueDate, $this->uuid())) {
            throw new AppException('NOT_FOUND', 'Die Haushaltsaufgabe wurde nicht gefunden.', 404);
        }
        return $this->board();
    }

    /** @param array{id: string, role: string} $actor */
    public function delete(string $uuid, array $actor): void
    {
        $this->requireAdult($actor);
        if (!$this->chores->softDelete($uuid)) { throw new AppException('NOT_FOUND', 'Die Haushaltsaufgabe wurde nicht gefunden.', 404); }
    }

    /** @param array<string, mixed> $input @param array<string, mixed>|null $existing @return array<string, mixed> */
    private function validate(array $input, ?array $existing = null): array
    {
        $title = trim((string) ($input['title'] ?? $existing['title'] ?? ''));
        $description = trim((string) ($input['description'] ?? $existing['description'] ?? ''));
        $category = strtoupper((string) ($input['category'] ?? $existing['category'] ?? 'CLEANING'));
        $memberId = (string) ($input['assignedMemberId'] ?? $existing['assignedMember']['id'] ?? '');
        $recurrence = strtoupper((string) ($input['recurrence'] ?? $existing['recurrence'] ?? 'WEEKLY'));
        $nextDueDate = (string) ($input['nextDueDate'] ?? $existing['nextDueDate'] ?? '');
        $member = $this->members->find($memberId);
        if (mb_strlen($title) < 2 || mb_strlen($title) > 120 || mb_strlen($description) > 600 || !in_array($category, self::CATEGORIES, true) || !in_array($recurrence, self::RECURRENCES, true) || !$this->validDate($nextDueDate) || $member === null || !$member->isActive) {
            throw new AppException('VALIDATION_ERROR', 'Titel, Kategorie, Zuständigkeit, Wiederholung oder Fälligkeit ist ungültig.', 422);
        }
        return ['title' => $title, 'description' => $description === '' ? null : $description, 'category' => $category, 'assigned_member_uuid' => $memberId, 'recurrence' => $recurrence, 'next_due_date' => $nextDueDate];
    }

    private function nextDueDate(string $scheduledDate, string $recurrence): ?string
    {
        if ($recurrence === 'ONCE') { return null; }
        $today = new DateTimeImmutable('today');
        $base = new DateTimeImmutable($scheduledDate);
        if ($base < $today) { $base = $today; }
        return match ($recurrence) {
            'DAILY' => $base->modify('+1 day')->format('Y-m-d'),
            'WEEKLY' => $base->modify('+7 days')->format('Y-m-d'),
            'BIWEEKLY' => $base->modify('+14 days')->format('Y-m-d'),
            'MONTHLY' => $this->nextMonth($base),
            default => null,
        };
    }

    private function nextMonth(DateTimeImmutable $base): string
    {
        $day = (int) $base->format('j');
        $next = $base->modify('first day of next month');
        $day = min($day, (int) $next->format('t'));
        return $next->setDate((int) $next->format('Y'), (int) $next->format('n'), $day)->format('Y-m-d');
    }

    /** @param array{id: string, role: string} $actor */
    private function requireAdult(array $actor): void
    {
        if (!in_array($actor['role'], ['ADMIN', 'PARENT'], true)) { throw new AppException('FORBIDDEN', 'Nur Erwachsene können den Haushaltsplan verwalten.', 403); }
    }

    private function validDate(string $value): bool { $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value); return $date !== false && $date->format('Y-m-d') === $value; }
    private function uuid(): string { $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); $hex = bin2hex($bytes); return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20)); }
}
