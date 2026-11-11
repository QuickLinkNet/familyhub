<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\FamilyGoalRepository;

final class FamilyGoalService
{
    private const ICONS = ['🎯', '🏕️', '🚲', '🎡', '🌳', '🍕', '🏖️', '🎬', '🎨', '🧩', '⭐', '❤️'];
    public function __construct(private FamilyGoalRepository $goals) {}
    /** @return array<string, mixed> */
    public function board(): array { return $this->goals->board(); }

    /** @param array<string, mixed> $input @param array{id: string} $actor */
    public function create(array $input, array $actor): array
    {
        if ($this->goals->activeCount() >= 6) { throw new AppException('GOAL_LIMIT_REACHED', 'Schließt zuerst eines der sechs aktiven Familienziele ab.', 409); }
        $now = gmdate('c');
        $this->goals->create($this->validate($input) + ['uuid' => $this->uuid(), 'created_by_member_uuid' => $actor['id'], 'created_at' => $now, 'updated_at' => $now]);
        return $this->board();
    }

    /** @param array<string, mixed> $input */
    public function update(string $uuid, array $input): array
    {
        $existing = $this->goals->find($uuid) ?? throw new AppException('NOT_FOUND', 'Das Familienziel wurde nicht gefunden.', 404);
        if ($existing['completedAt'] !== null) { throw new AppException('GOAL_COMPLETED', 'Ein erreichtes Familienziel kann nicht mehr bearbeitet werden.', 409); }
        $validated = $this->validate($input, $existing);
        if ($validated['target_value'] < $existing['currentValue']) { throw new AppException('VALIDATION_ERROR', 'Das Ziel darf nicht kleiner als der bereits erreichte Fortschritt sein.', 422); }
        if (!$this->goals->update($uuid, $validated + ['updated_at' => gmdate('c')])) { throw new AppException('NOT_FOUND', 'Das Familienziel wurde nicht gefunden.', 404); }
        return $this->board();
    }

    /** @param array<string, mixed> $input @param array{id: string} $actor */
    public function contribute(string $uuid, array $input, array $actor): array
    {
        $amount = filter_var($input['amount'] ?? 1, FILTER_VALIDATE_INT);
        $note = trim((string) ($input['note'] ?? ''));
        if ($amount === false || $amount < 1 || $amount > 10 || mb_strlen($note) > 120) { throw new AppException('VALIDATION_ERROR', 'Fortschritt oder Notiz ist ungültig.', 422); }
        if ($this->goals->find($uuid) === null) { throw new AppException('NOT_FOUND', 'Das Familienziel wurde nicht gefunden.', 404); }
        $added = $this->goals->contribute($uuid, ['uuid' => $this->uuid(), 'member_uuid' => $actor['id'], 'amount' => $amount, 'note' => $note === '' ? null : $note, 'created_at' => gmdate('c')]);
        if ($added < 1) { throw new AppException('GOAL_COMPLETED', 'Dieses Familienziel ist bereits geschafft.', 409); }
        return $this->board();
    }

    public function delete(string $uuid): void
    {
        if (!$this->goals->softDelete($uuid)) { throw new AppException('NOT_FOUND', 'Das Familienziel wurde nicht gefunden.', 404); }
    }

    /** @param array<string, mixed> $input @param array<string, mixed>|null $existing @return array<string, mixed> */
    private function validate(array $input, ?array $existing = null): array
    {
        $title = trim((string) ($input['title'] ?? $existing['title'] ?? ''));
        $description = trim((string) ($input['description'] ?? $existing['description'] ?? ''));
        $icon = (string) ($input['icon'] ?? $existing['icon'] ?? '🎯');
        $color = strtoupper((string) ($input['color'] ?? $existing['color'] ?? '#D6855F'));
        $target = filter_var($input['targetValue'] ?? $existing['targetValue'] ?? null, FILTER_VALIDATE_INT);
        $dueDate = trim((string) ($input['dueDate'] ?? $existing['dueDate'] ?? ''));
        if (mb_strlen($title) < 2 || mb_strlen($title) > 100 || mb_strlen($description) > 500 || !in_array($icon, self::ICONS, true) || preg_match('/^#[0-9A-F]{6}$/', $color) !== 1 || $target === false || $target < 2 || $target > 100 || ($dueDate !== '' && !$this->validDate($dueDate))) {
            throw new AppException('VALIDATION_ERROR', 'Titel, Beschreibung, Symbol, Farbe, Zielgröße oder Datum ist ungültig.', 422);
        }
        return ['title' => $title, 'description' => $description === '' ? null : $description, 'icon' => $icon, 'color' => $color, 'target_value' => $target, 'due_date' => $dueDate === '' ? null : $dueDate];
    }

    private function validDate(string $value): bool { $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value); return $date !== false && $date->format('Y-m-d') === $value; }
    private function uuid(): string { $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); $hex = bin2hex($bytes); return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20)); }
}
