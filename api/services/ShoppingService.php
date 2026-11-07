<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\ShoppingRepository;

final class ShoppingService
{
    private const CATEGORIES = ['PRODUCE', 'BAKERY', 'DAIRY', 'MEAT', 'PANTRY', 'FROZEN', 'DRINKS', 'HOUSEHOLD', 'HYGIENE', 'OTHER'];
    private const ICONS = ['🛒', '🛍️', '🥕', '🏠', '🎉', '🧺'];

    public function __construct(private ShoppingRepository $shopping) {}

    /** @return list<array<string, mixed>> */
    public function list(): array { return $this->shopping->all(); }

    /** @param array<string, mixed> $input @param array{id: string} $actor */
    public function createList(array $input, array $actor): array
    {
        $name = trim((string) ($input['name'] ?? ''));
        $icon = (string) ($input['icon'] ?? '🛒');
        $color = strtoupper((string) ($input['color'] ?? '#345B48'));
        if (mb_strlen($name) < 2 || mb_strlen($name) > 60 || !in_array($icon, self::ICONS, true) || preg_match('/^#[0-9A-F]{6}$/', $color) !== 1) {
            throw new AppException('VALIDATION_ERROR', 'Name, Symbol oder Farbe der Liste ist ungültig.', 422);
        }
        $now = gmdate('c');
        $this->shopping->createList(['uuid' => $this->uuid(), 'name' => $name, 'icon' => $icon, 'color' => $color, 'sort_order' => count($this->shopping->all()), 'created_by_member_uuid' => $actor['id'], 'created_at' => $now, 'updated_at' => $now]);
        return $this->list();
    }

    /** @param array<string, mixed> $input @param array{id: string} $actor */
    public function createItem(string $listUuid, array $input, array $actor): array
    {
        if ($this->shopping->findList($listUuid) === null) { throw new AppException('NOT_FOUND', 'Die Einkaufsliste wurde nicht gefunden.', 404); }
        $data = $this->itemData($input);
        $now = gmdate('c');
        $this->shopping->createItem($data + ['uuid' => $this->uuid(), 'list_uuid' => $listUuid, 'added_by_member_uuid' => $actor['id'], 'created_at' => $now, 'updated_at' => $now]);
        return $this->list();
    }

    /** @param array<string, mixed> $input */
    public function updateItem(string $uuid, array $input): array
    {
        $existing = $this->shopping->findItem($uuid) ?? throw new AppException('NOT_FOUND', 'Der Einkaufsartikel wurde nicht gefunden.', 404);
        if ($existing['is_checked']) { throw new AppException('CONFLICT', 'Abgehakte Artikel können nicht mehr bearbeitet werden.', 409); }
        if (!$this->shopping->updateItem($uuid, $this->itemData($input) + ['updated_at' => gmdate('c')])) { throw new AppException('NOT_FOUND', 'Der Einkaufsartikel wurde nicht gefunden.', 404); }
        return $this->list();
    }

    /** @param array{id: string} $actor */
    public function toggle(string $uuid, array $actor): array
    {
        if (!$this->shopping->toggleItem($uuid, $actor['id'])) { throw new AppException('NOT_FOUND', 'Der Einkaufsartikel wurde nicht gefunden.', 404); }
        return $this->list();
    }

    public function deleteItem(string $uuid): void
    {
        if (!$this->shopping->deleteItem($uuid)) { throw new AppException('NOT_FOUND', 'Der Einkaufsartikel wurde nicht gefunden.', 404); }
    }

    public function clearChecked(string $listUuid): array
    {
        if ($this->shopping->findList($listUuid) === null) { throw new AppException('NOT_FOUND', 'Die Einkaufsliste wurde nicht gefunden.', 404); }
        $this->shopping->clearChecked($listUuid);
        return $this->list();
    }

    public function deleteList(string $uuid): void
    {
        if (!$this->shopping->deleteList($uuid)) { throw new AppException('NOT_FOUND', 'Die Einkaufsliste wurde nicht gefunden.', 404); }
    }

    /** @param array<string, mixed> $input @return array<string, mixed> */
    private function itemData(array $input): array
    {
        $name = trim((string) ($input['name'] ?? ''));
        $quantity = trim((string) ($input['quantity'] ?? ''));
        $category = strtoupper((string) ($input['category'] ?? 'OTHER'));
        $note = trim((string) ($input['note'] ?? ''));
        $urgent = filter_var($input['isUrgent'] ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if (mb_strlen($name) < 1 || mb_strlen($name) > 100 || mb_strlen($quantity) > 30 || mb_strlen($note) > 300 || !in_array($category, self::CATEGORIES, true) || $urgent === null) {
            throw new AppException('VALIDATION_ERROR', 'Artikel, Menge oder Kategorie ist ungültig.', 422);
        }
        return ['name' => $name, 'quantity' => $quantity === '' ? null : $quantity, 'category' => $category, 'note' => $note === '' ? null : $note, 'is_urgent' => $urgent ? 1 : 0];
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
