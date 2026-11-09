<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\SchoolRepository;

final class SchoolService
{
    private const TYPES = ['HOMEWORK', 'TEST'];
    private const COLORS = ['#D6855F', '#4F8A62', '#5B7DB1', '#9B6BB1', '#CB8B33', '#C85C5C'];

    public function __construct(private SchoolRepository $school, private FamilyMemberRepository $members) {}

    /** @return array{lessons: list<array<string, mixed>>, items: list<array<string, mixed>>} */
    public function board(string $from, string $to): array
    {
        if (!$this->validDate($from) || !$this->validDate($to) || $from > $to || (new DateTimeImmutable($from))->diff(new DateTimeImmutable($to))->days > 62) {
            throw new AppException('VALIDATION_ERROR', 'Der Schulzeitraum ist ungültig.', 422);
        }
        return $this->school->board($from, $to);
    }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor */
    public function createLesson(array $input, array $actor): array
    {
        $this->requireAdult($actor);
        $now = gmdate('c');
        $this->school->createLesson($this->validateLesson($input) + ['uuid' => $this->uuid(), 'created_by_member_uuid' => $actor['id'], 'created_at' => $now, 'updated_at' => $now]);
        return $this->defaultBoard();
    }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor */
    public function updateLesson(string $uuid, array $input, array $actor): array
    {
        $this->requireAdult($actor);
        $existing = $this->school->findLesson($uuid) ?? throw new AppException('NOT_FOUND', 'Die Schulstunde wurde nicht gefunden.', 404);
        if (!$this->school->updateLesson($uuid, $this->validateLesson($input, $existing) + ['updated_at' => gmdate('c')])) {
            throw new AppException('NOT_FOUND', 'Die Schulstunde wurde nicht gefunden.', 404);
        }
        return $this->defaultBoard();
    }

    /** @param array{id: string, role: string} $actor */
    public function deleteLesson(string $uuid, array $actor): void
    {
        $this->requireAdult($actor);
        if (!$this->school->softDelete('school_lessons', $uuid)) { throw new AppException('NOT_FOUND', 'Die Schulstunde wurde nicht gefunden.', 404); }
    }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor */
    public function createItem(array $input, array $actor): array
    {
        $data = $this->validateItem($input);
        $this->requireOwnOrAdult($data['member_uuid'], $actor);
        $now = gmdate('c');
        $this->school->createItem($data + ['uuid' => $this->uuid(), 'created_by_member_uuid' => $actor['id'], 'created_at' => $now, 'updated_at' => $now]);
        return $this->defaultBoard();
    }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor */
    public function updateItem(string $uuid, array $input, array $actor): array
    {
        $existing = $this->school->findItem($uuid) ?? throw new AppException('NOT_FOUND', 'Der Schuleintrag wurde nicht gefunden.', 404);
        $this->requireOwnOrAdult($existing['member']['id'], $actor);
        $data = $this->validateItem($input, $existing);
        $this->requireOwnOrAdult($data['member_uuid'], $actor);
        if (!$this->school->updateItem($uuid, $data + ['updated_at' => gmdate('c')])) { throw new AppException('NOT_FOUND', 'Der Schuleintrag wurde nicht gefunden.', 404); }
        return $this->defaultBoard();
    }

    /** @param array{id: string, role: string} $actor */
    public function toggleItem(string $uuid, array $actor): array
    {
        $existing = $this->school->findItem($uuid) ?? throw new AppException('NOT_FOUND', 'Der Schuleintrag wurde nicht gefunden.', 404);
        $this->requireOwnOrAdult($existing['member']['id'], $actor);
        if (!$this->school->toggleItem($uuid, $existing['completedAt'] === null)) { throw new AppException('NOT_FOUND', 'Der Schuleintrag wurde nicht gefunden.', 404); }
        return $this->defaultBoard();
    }

    /** @param array{id: string, role: string} $actor */
    public function deleteItem(string $uuid, array $actor): void
    {
        $existing = $this->school->findItem($uuid) ?? throw new AppException('NOT_FOUND', 'Der Schuleintrag wurde nicht gefunden.', 404);
        $this->requireOwnOrAdult($existing['member']['id'], $actor);
        if (!$this->school->softDelete('school_items', $uuid)) { throw new AppException('NOT_FOUND', 'Der Schuleintrag wurde nicht gefunden.', 404); }
    }

    /** @param array<string, mixed> $input @param array<string, mixed>|null $existing @return array<string, mixed> */
    private function validateLesson(array $input, ?array $existing = null): array
    {
        $memberId = (string) ($input['memberId'] ?? $existing['member']['id'] ?? '');
        $subject = trim((string) ($input['subject'] ?? $existing['subject'] ?? ''));
        $weekday = filter_var($input['weekday'] ?? $existing['weekday'] ?? null, FILTER_VALIDATE_INT);
        $startsAt = (string) ($input['startsAt'] ?? $existing['startsAt'] ?? '');
        $endsAt = (string) ($input['endsAt'] ?? $existing['endsAt'] ?? '');
        $room = trim((string) ($input['room'] ?? $existing['room'] ?? ''));
        $teacher = trim((string) ($input['teacher'] ?? $existing['teacher'] ?? ''));
        $color = strtoupper((string) ($input['color'] ?? $existing['color'] ?? '#5B7DB1'));
        $this->requireMember($memberId);
        if (mb_strlen($subject) < 2 || mb_strlen($subject) > 60 || $weekday === false || $weekday < 1 || $weekday > 7 || !$this->validTime($startsAt) || !$this->validTime($endsAt) || $startsAt >= $endsAt || mb_strlen($room) > 40 || mb_strlen($teacher) > 80 || !in_array($color, self::COLORS, true)) {
            throw new AppException('VALIDATION_ERROR', 'Fach, Wochentag oder Unterrichtszeit ist ungültig.', 422);
        }
        return ['member_uuid' => $memberId, 'subject' => $subject, 'weekday' => $weekday, 'starts_at' => $startsAt, 'ends_at' => $endsAt, 'room' => $room === '' ? null : $room, 'teacher' => $teacher === '' ? null : $teacher, 'color' => $color];
    }

    /** @param array<string, mixed> $input @param array<string, mixed>|null $existing @return array<string, mixed> */
    private function validateItem(array $input, ?array $existing = null): array
    {
        $memberId = (string) ($input['memberId'] ?? $existing['member']['id'] ?? '');
        $type = strtoupper((string) ($input['itemType'] ?? $existing['itemType'] ?? 'HOMEWORK'));
        $subject = trim((string) ($input['subject'] ?? $existing['subject'] ?? ''));
        $title = trim((string) ($input['title'] ?? $existing['title'] ?? ''));
        $description = trim((string) ($input['description'] ?? $existing['description'] ?? ''));
        $dueDate = (string) ($input['dueDate'] ?? $existing['dueDate'] ?? '');
        $this->requireMember($memberId);
        if (!in_array($type, self::TYPES, true) || mb_strlen($subject) < 2 || mb_strlen($subject) > 60 || mb_strlen($title) < 2 || mb_strlen($title) > 140 || mb_strlen($description) > 1000 || !$this->validDate($dueDate)) {
            throw new AppException('VALIDATION_ERROR', 'Art, Fach, Titel oder Datum des Schuleintrags ist ungültig.', 422);
        }
        return ['member_uuid' => $memberId, 'item_type' => $type, 'subject' => $subject, 'title' => $title, 'description' => $description === '' ? null : $description, 'due_date' => $dueDate];
    }

    /** @return array{lessons: list<array<string, mixed>>, items: list<array<string, mixed>>} */
    private function defaultBoard(): array { $today = new DateTimeImmutable('today'); return $this->school->board($today->modify('-14 days')->format('Y-m-d'), $today->modify('+48 days')->format('Y-m-d')); }
    private function requireMember(string $uuid): void { if ($this->members->find($uuid) === null) { throw new AppException('VALIDATION_ERROR', 'Das Familienmitglied wurde nicht gefunden.', 422); } }
    /** @param array{id: string, role: string} $actor */
    private function requireAdult(array $actor): void { if (!in_array($actor['role'], ['ADMIN', 'PARENT'], true)) { throw new AppException('FORBIDDEN', 'Nur Erwachsene können den Stundenplan verwalten.', 403); } }
    /** @param array{id: string, role: string} $actor */
    private function requireOwnOrAdult(string $memberId, array $actor): void { if (!in_array($actor['role'], ['ADMIN', 'PARENT'], true) && $memberId !== $actor['id']) { throw new AppException('FORBIDDEN', 'Kinder können nur eigene Schuleinträge verwalten.', 403); } }
    private function validDate(string $value): bool { $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value); return $date !== false && $date->format('Y-m-d') === $value; }
    private function validTime(string $value): bool { return preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $value) === 1; }
    private function uuid(): string { $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); $hex = bin2hex($bytes); return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20)); }
}
