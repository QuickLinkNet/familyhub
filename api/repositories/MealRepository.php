<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class MealRepository
{
    public function __construct(private PDO $database) {}

    /** @return array<string, mixed> */
    public function planner(string $from, string $to): array
    {
        $recipes = $this->database->query('SELECT * FROM meal_recipes WHERE deleted_at IS NULL ORDER BY title COLLATE NOCASE')->fetchAll();
        $ingredients = $this->database->query('SELECT * FROM meal_recipe_ingredients WHERE deleted_at IS NULL ORDER BY recipe_uuid, sort_order')->fetchAll();
        $byRecipe = [];
        foreach ($ingredients as $ingredient) { $byRecipe[$ingredient['recipe_uuid']][] = $this->mapIngredient($ingredient); }
        $statement = $this->database->prepare('SELECT * FROM meal_plan_entries WHERE planned_date BETWEEN :from_date AND :to_date AND deleted_at IS NULL ORDER BY planned_date, CASE meal_type WHEN \'BREAKFAST\' THEN 1 WHEN \'LUNCH\' THEN 2 ELSE 3 END');
        $statement->execute(['from_date' => $from, 'to_date' => $to]);
        return [
            'recipes' => array_map(fn (array $recipe): array => $this->mapRecipe($recipe, $byRecipe[$recipe['uuid']] ?? []), $recipes),
            'entries' => array_map([$this, 'mapEntry'], $statement->fetchAll()),
        ];
    }

    /** @return array<string, mixed>|null */
    public function findRecipe(string $uuid): ?array
    {
        $statement = $this->database->prepare('SELECT * FROM meal_recipes WHERE uuid = :uuid AND deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $recipe = $statement->fetch();
        if ($recipe === false) { return null; }
        $ingredients = $this->database->prepare('SELECT * FROM meal_recipe_ingredients WHERE recipe_uuid = :uuid AND deleted_at IS NULL ORDER BY sort_order');
        $ingredients->execute(['uuid' => $uuid]);
        return $this->mapRecipe($recipe, array_map([$this, 'mapIngredient'], $ingredients->fetchAll()));
    }

    /** @param array<string, mixed> $recipe @param list<array<string, mixed>> $ingredients */
    public function createRecipe(array $recipe, array $ingredients): void
    {
        $this->database->beginTransaction();
        try {
            $statement = $this->database->prepare('INSERT INTO meal_recipes (uuid, title, description, icon, color, prep_minutes, created_by_member_uuid, created_at, updated_at) VALUES (:uuid, :title, :description, :icon, :color, :prep_minutes, :created_by_member_uuid, :created_at, :updated_at)');
            $statement->execute($recipe);
            $ingredientStatement = $this->database->prepare('INSERT INTO meal_recipe_ingredients (uuid, recipe_uuid, name, quantity, category, sort_order, created_at) VALUES (:uuid, :recipe_uuid, :name, :quantity, :category, :sort_order, :created_at)');
            foreach ($ingredients as $ingredient) { $ingredientStatement->execute($ingredient); }
            $this->database->commit();
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    public function deleteRecipe(string $uuid): bool
    {
        $now = gmdate('c');
        $this->database->beginTransaction();
        try {
            $recipe = $this->database->prepare('UPDATE meal_recipes SET deleted_at = :now, updated_at = :now WHERE uuid = :uuid AND deleted_at IS NULL');
            $recipe->execute(['uuid' => $uuid, 'now' => $now]);
            if ($recipe->rowCount() !== 1) { $this->database->rollBack(); return false; }
            $ingredients = $this->database->prepare('UPDATE meal_recipe_ingredients SET deleted_at = :now WHERE recipe_uuid = :uuid AND deleted_at IS NULL');
            $ingredients->execute(['uuid' => $uuid, 'now' => $now]);
            $this->database->commit();
            return true;
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    /** @param array<string, mixed> $data */
    public function upsertEntry(array $data): void
    {
        $existing = $this->database->prepare('SELECT uuid FROM meal_plan_entries WHERE planned_date = :planned_date AND meal_type = :meal_type AND deleted_at IS NULL LIMIT 1');
        $existing->execute(['planned_date' => $data['planned_date'], 'meal_type' => $data['meal_type']]);
        $uuid = $existing->fetchColumn();
        if (is_string($uuid)) {
            $update = $this->database->prepare('UPDATE meal_plan_entries SET recipe_uuid = :recipe_uuid, title = :title, note = :note, updated_at = :updated_at WHERE uuid = :uuid');
            $update->execute(['uuid' => $uuid, 'recipe_uuid' => $data['recipe_uuid'], 'title' => $data['title'], 'note' => $data['note'], 'updated_at' => $data['updated_at']]);
            return;
        }
        $insert = $this->database->prepare('INSERT INTO meal_plan_entries (uuid, planned_date, meal_type, recipe_uuid, title, note, created_by_member_uuid, created_at, updated_at) VALUES (:uuid, :planned_date, :meal_type, :recipe_uuid, :title, :note, :created_by_member_uuid, :created_at, :updated_at)');
        $insert->execute($data);
    }

    public function deleteEntry(string $uuid): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare('UPDATE meal_plan_entries SET deleted_at = :now, updated_at = :now WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute(['uuid' => $uuid, 'now' => $now]);
        return $statement->rowCount() === 1;
    }

    /** @param array<string, mixed> $row @param list<array<string, mixed>> $ingredients @return array<string, mixed> */
    private function mapRecipe(array $row, array $ingredients): array
    {
        return ['id' => $row['uuid'], 'title' => $row['title'], 'description' => $row['description'], 'icon' => $row['icon'], 'color' => $row['color'], 'prepMinutes' => $row['prep_minutes'] === null ? null : (int) $row['prep_minutes'], 'ingredients' => $ingredients, 'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at']];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapIngredient(array $row): array
    {
        return ['id' => $row['uuid'], 'name' => $row['name'], 'quantity' => $row['quantity'], 'category' => $row['category']];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function mapEntry(array $row): array
    {
        return ['id' => $row['uuid'], 'date' => $row['planned_date'], 'mealType' => $row['meal_type'], 'recipeId' => $row['recipe_uuid'], 'title' => $row['title'], 'note' => $row['note'], 'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at']];
    }
}
