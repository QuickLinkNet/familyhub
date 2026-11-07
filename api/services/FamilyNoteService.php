<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\FamilyNoteRepository;

final class FamilyNoteService
{
    private const ICONS = ['📌', '💬', '❤️', '💡', '🏫', '🛒', '🎉', '🏠'];
    private const COLORS = ['#D6855F', '#4F8A62', '#5B7DB1', '#9B6BB1', '#CB8B33', '#C85C5C'];

    public function __construct(private FamilyNoteRepository $notes) {}

    /** @return list<array<string, mixed>> */
    public function board(): array { return $this->notes->visible(gmdate('Y-m-d')); }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor @return list<array<string, mixed>> */
    public function create(array $input, array $actor): array
    {
        $data = $this->validate($input);
        $now = gmdate('c');
        $this->notes->create($data + [
            'uuid' => $this->uuid(),
            'created_by_member_uuid' => $actor['id'],
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        return $this->board();
    }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor @return list<array<string, mixed>> */
    public function update(string $uuid, array $input, array $actor): array
    {
        $existing = $this->notes->find($uuid) ?? throw new AppException('NOT_FOUND', 'Der Pinnwand-Zettel wurde nicht gefunden.', 404);
        $this->requireOwnerOrAdult($existing, $actor);
        if (!$this->notes->update($uuid, $this->validate($input, $existing) + ['updated_at' => gmdate('c')])) {
            throw new AppException('NOT_FOUND', 'Der Pinnwand-Zettel wurde nicht gefunden.', 404);
        }
        return $this->board();
    }

    /** @param array{id: string, role: string} $actor */
    public function delete(string $uuid, array $actor): void
    {
        $existing = $this->notes->find($uuid) ?? throw new AppException('NOT_FOUND', 'Der Pinnwand-Zettel wurde nicht gefunden.', 404);
        $this->requireOwnerOrAdult($existing, $actor);
        if (!$this->notes->softDelete($uuid)) {
            throw new AppException('NOT_FOUND', 'Der Pinnwand-Zettel wurde nicht gefunden.', 404);
        }
    }

    /** @param array<string, mixed> $input @param array<string, mixed>|null $existing @return array<string, mixed> */
    private function validate(array $input, ?array $existing = null): array
    {
        $title = trim((string) ($input['title'] ?? $existing['title'] ?? ''));
        $body = trim((string) ($input['body'] ?? $existing['body'] ?? ''));
        $icon = (string) ($input['icon'] ?? $existing['icon'] ?? '📌');
        $color = strtoupper((string) ($input['color'] ?? $existing['color'] ?? '#D6855F'));
        $important = array_key_exists('isImportant', $input)
            ? filter_var($input['isImportant'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : (bool) ($existing['isImportant'] ?? false);
        $expiresOn = array_key_exists('expiresOn', $input) ? trim((string) ($input['expiresOn'] ?? '')) : (string) ($existing['expiresOn'] ?? '');
        $expiresOn = $expiresOn === '' ? null : $expiresOn;

        if (mb_strlen($title) < 2 || mb_strlen($title) > 80 || mb_strlen($body) < 2 || mb_strlen($body) > 800) {
            throw new AppException('VALIDATION_ERROR', 'Titel oder Nachricht ist ungültig.', 422);
        }
        if (!in_array($icon, self::ICONS, true) || !in_array($color, self::COLORS, true) || $important === null) {
            throw new AppException('VALIDATION_ERROR', 'Symbol, Farbe oder Wichtig-Markierung ist ungültig.', 422);
        }
        if ($expiresOn !== null) {
            $date = DateTimeImmutable::createFromFormat('!Y-m-d', $expiresOn);
            if ($date === false || $date->format('Y-m-d') !== $expiresOn || $expiresOn < gmdate('Y-m-d')) {
                throw new AppException('VALIDATION_ERROR', 'Das Ablaufdatum muss heute oder in der Zukunft liegen.', 422);
            }
        }
        return [
            'title' => $title,
            'body' => $body,
            'icon' => $icon,
            'color' => $color,
            'is_important' => $important ? 1 : 0,
            'expires_on' => $expiresOn,
        ];
    }

    /** @param array<string, mixed> $note @param array{id: string, role: string} $actor */
    private function requireOwnerOrAdult(array $note, array $actor): void
    {
        if (!in_array($actor['role'], ['ADMIN', 'PARENT'], true) && $note['createdBy']['id'] !== $actor['id']) {
            throw new AppException('FORBIDDEN', 'Du kannst nur deine eigenen Pinnwand-Zettel ändern.', 403);
        }
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
