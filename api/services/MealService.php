<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\MealRepository;
use FamilyCompass\Repositories\ShoppingRepository;

final class MealService
{
    private const TYPES = ['BREAKFAST', 'LUNCH', 'DINNER'];
    private const CATEGORIES = ['PRODUCE', 'BAKERY', 'DAIRY', 'MEAT', 'PANTRY', 'FROZEN', 'DRINKS', 'HOUSEHOLD', 'HYGIENE', 'OTHER'];
    private const ICONS = ['🍽️', '🍝', '🍕', '🥗', '🍲', '🌮', '🥞', '🍛', '🥪', '🥘', '🍣', '🧁'];

    public function __construct(private MealRepository $meals, private ShoppingRepository $shopping) {}

    /** @return array<string, mixed> */
    public function planner(string $from, string $to): array
    {
        if (!$this->validDate($from) || !$this->validDate($to) || $from > $to || (new DateTimeImmutable($from))->diff(new DateTimeImmutable($to))->days > 31) {
            throw new AppException('VALIDATION_ERROR', 'Der Planungszeitraum ist ungültig.', 422);
        }
        return $this->meals->planner($from, $to);
    }

    /** @param array<string, mixed> $input @param array{id: string} $actor */
    public function createRecipe(array $input, array $actor): array
    {
        $title = trim((string) ($input['title'] ?? '')); $description = trim((string) ($input['description'] ?? '')); $icon = (string) ($input['icon'] ?? '🍽️'); $color = strtoupper((string) ($input['color'] ?? '#D6855F'));
        $minutes = ($input['prepMinutes'] ?? '') === '' || ($input['prepMinutes'] ?? null) === null ? null : filter_var($input['prepMinutes'], FILTER_VALIDATE_INT);
        $rawIngredients = $input['ingredients'] ?? [];
        if (mb_strlen($title) < 2 || mb_strlen($title) > 100 || mb_strlen($description) > 500 || !in_array($icon, self::ICONS, true) || preg_match('/^#[0-9A-F]{6}$/', $color) !== 1 || ($minutes !== null && ($minutes === false || $minutes < 1 || $minutes > 1440)) || !is_array($rawIngredients) || count($rawIngredients) > 50) {
            throw new AppException('VALIDATION_ERROR', 'Rezeptname, Zubereitungszeit oder Darstellung ist ungültig.', 422);
        }
        $now = gmdate('c'); $recipeUuid = $this->uuid(); $ingredients = [];
        foreach (array_values($rawIngredients) as $index => $ingredient) {
            if (!is_array($ingredient)) { throw new AppException('VALIDATION_ERROR', 'Eine Zutat ist ungültig.', 422); }
            $name = trim((string) ($ingredient['name'] ?? '')); $quantity = trim((string) ($ingredient['quantity'] ?? '')); $category = strtoupper((string) ($ingredient['category'] ?? 'OTHER'));
            if (mb_strlen($name) < 1 || mb_strlen($name) > 100 || mb_strlen($quantity) > 30 || !in_array($category, self::CATEGORIES, true)) { throw new AppException('VALIDATION_ERROR', 'Name, Menge oder Bereich einer Zutat ist ungültig.', 422); }
            $ingredients[] = ['uuid' => $this->uuid(), 'recipe_uuid' => $recipeUuid, 'name' => $name, 'quantity' => $quantity === '' ? null : $quantity, 'category' => $category, 'sort_order' => $index, 'created_at' => $now];
        }
        $this->meals->createRecipe(['uuid' => $recipeUuid, 'title' => $title, 'description' => $description === '' ? null : $description, 'icon' => $icon, 'color' => $color, 'prep_minutes' => $minutes, 'created_by_member_uuid' => $actor['id'], 'created_at' => $now, 'updated_at' => $now], $ingredients);
        return $this->meals->planner((new DateTimeImmutable('monday this week'))->format('Y-m-d'), (new DateTimeImmutable('sunday this week'))->format('Y-m-d'));
    }

    public function deleteRecipe(string $uuid): void
    {
        if (!$this->meals->deleteRecipe($uuid)) { throw new AppException('NOT_FOUND', 'Das Lieblingsgericht wurde nicht gefunden.', 404); }
    }

    /** @param array<string, mixed> $input @param array{id: string} $actor */
    public function plan(array $input, array $actor): array
    {
        $date = (string) ($input['date'] ?? ''); $type = strtoupper((string) ($input['mealType'] ?? 'DINNER')); $recipeUuid = ($input['recipeId'] ?? '') === '' ? null : (string) $input['recipeId']; $title = trim((string) ($input['title'] ?? '')); $note = trim((string) ($input['note'] ?? ''));
        if ($recipeUuid !== null) {
            $recipe = $this->meals->findRecipe($recipeUuid) ?? throw new AppException('VALIDATION_ERROR', 'Das Lieblingsgericht wurde nicht gefunden.', 422);
            $title = (string) $recipe['title'];
        }
        if (!$this->validDate($date) || !in_array($type, self::TYPES, true) || mb_strlen($title) < 2 || mb_strlen($title) > 100 || mb_strlen($note) > 300) {
            throw new AppException('VALIDATION_ERROR', 'Datum, Mahlzeit oder Gericht ist ungültig.', 422);
        }
        $now = gmdate('c');
        $this->meals->upsertEntry(['uuid' => $this->uuid(), 'planned_date' => $date, 'meal_type' => $type, 'recipe_uuid' => $recipeUuid, 'title' => $title, 'note' => $note === '' ? null : $note, 'created_by_member_uuid' => $actor['id'], 'created_at' => $now, 'updated_at' => $now]);
        $start = (new DateTimeImmutable($date))->modify('monday this week');
        return $this->meals->planner($start->format('Y-m-d'), $start->modify('+6 days')->format('Y-m-d'));
    }

    public function deleteEntry(string $uuid): void
    {
        if (!$this->meals->deleteEntry($uuid)) { throw new AppException('NOT_FOUND', 'Der Planeintrag wurde nicht gefunden.', 404); }
    }

    /** @param array<string, mixed> $input @param array{id: string} $actor @return array<string, mixed> */
    public function addToShopping(string $recipeUuid, array $input, array $actor): array
    {
        $recipe = $this->meals->findRecipe($recipeUuid) ?? throw new AppException('NOT_FOUND', 'Das Lieblingsgericht wurde nicht gefunden.', 404);
        $listUuid = (string) ($input['listId'] ?? '');
        if ($this->shopping->findList($listUuid) === null) { throw new AppException('VALIDATION_ERROR', 'Die Einkaufsliste wurde nicht gefunden.', 422); }
        if ($recipe['ingredients'] === []) { throw new AppException('CONFLICT', 'Dieses Gericht hat noch keine Zutaten.', 409); }
        $now = gmdate('c'); $items = [];
        foreach ($recipe['ingredients'] as $ingredient) {
            $items[] = ['uuid' => $this->uuid(), 'list_uuid' => $listUuid, 'name' => $ingredient['name'], 'quantity' => $ingredient['quantity'], 'category' => $ingredient['category'], 'note' => 'Für ' . $recipe['title'], 'is_urgent' => 0, 'added_by_member_uuid' => $actor['id'], 'created_at' => $now, 'updated_at' => $now];
        }
        $this->shopping->createItems($items);
        return ['addedCount' => count($items), 'recipeTitle' => $recipe['title'], 'listId' => $listUuid];
    }

    private function validDate(string $date): bool { $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date); return $parsed !== false && $parsed->format('Y-m-d') === $date; }
    private function uuid(): string { $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); $hex = bin2hex($bytes); return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20)); }
}
