<?php
declare(strict_types=1);

use FamilyCompass\Repositories\MealRepository;
use FamilyCompass\Repositories\ShoppingRepository;
use FamilyCompass\Services\MealService;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\'; if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php'; if (is_file($path)) { require $path; }
});

$database = new PDO('sqlite::memory:'); $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); $database->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$files = glob($apiPath . '/database/migrations/*.sql') ?: []; sort($files, SORT_NATURAL); foreach ($files as $file) { $database->exec((string) file_get_contents($file)); }
$now = gmdate('c'); $memberId = '11111111-1111-4111-8111-111111111111'; $listId = '22222222-2222-4222-8222-222222222222';
$database->prepare('INSERT INTO family_members (uuid, name, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)')->execute([$memberId, 'Testperson', '#345B48', 'PARENT', $now, $now]);
$database->prepare('INSERT INTO shopping_lists (uuid, name, icon, color, created_by_member_uuid, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')->execute([$listId, 'Testliste', '🛒', '#345B48', $memberId, $now, $now]);
$actor = ['id' => $memberId]; $meals = new MealRepository($database); $shopping = new ShoppingRepository($database); $service = new MealService($meals, $shopping);
$created = $service->createRecipe(['title' => 'Gemüsepasta', 'description' => 'Schnell und bunt', 'icon' => '🍝', 'color' => '#D6855F', 'prepMinutes' => 25, 'ingredients' => [['name' => 'Nudeln', 'quantity' => '500 g', 'category' => 'PANTRY'], ['name' => 'Tomaten', 'quantity' => '6', 'category' => 'PRODUCE']]], $actor);
$recipeId = $created['recipes'][0]['id'] ?? '';
$planned = $service->plan(['date' => '2026-11-07', 'mealType' => 'DINNER', 'recipeId' => $recipeId, 'title' => '', 'note' => 'Alle zusammen'], $actor);
$entry = $planned['entries'][0] ?? null;
$result = $service->addToShopping($recipeId, ['listId' => $listId], $actor);
$items = $shopping->all()[0]['items'] ?? [];
if ($recipeId === '' || $entry === null || $entry['title'] !== 'Gemüsepasta' || $entry['mealType'] !== 'DINNER' || $result['addedCount'] !== 2 || count($items) !== 2 || $items[0]['note'] !== 'Für Gemüsepasta') {
    fwrite(STDERR, "Meal planner smoke test failed.\n"); exit(1);
}
$service->deleteEntry($entry['id']); $service->deleteRecipe($recipeId);
$empty = $service->planner('2026-11-02', '2026-11-08');
if ($empty['entries'] !== [] || $empty['recipes'] !== []) { fwrite(STDERR, "Meal planner deletion smoke test failed.\n"); exit(1); }
echo "Meal planner smoke test passed.\n";
