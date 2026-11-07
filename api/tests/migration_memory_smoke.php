<?php
declare(strict_types=1);

$database = new PDO('sqlite::memory:');
$files = glob(dirname(__DIR__) . '/database/migrations/*.sql') ?: [];
sort($files, SORT_NATURAL);
foreach ($files as $file) {
    $sql = file_get_contents($file);
    if ($sql === false) {
        fwrite(STDERR, "Could not read migration {$file}.\n");
        exit(1);
    }
    $database->exec($sql);
}

$columns = $database->query('PRAGMA table_info(tasks)')->fetchAll(PDO::FETCH_ASSOC);
$names = array_column($columns, 'name');
foreach (['routine_period', 'repeat_days', 'series_uuid', 'reward_points'] as $required) {
    if (!in_array($required, $names, true)) {
        fwrite(STDERR, "Migration column {$required} is missing.\n");
        exit(1);
    }
}
$calendarColumns = array_column($database->query('PRAGMA table_info(calendar_events)')->fetchAll(PDO::FETCH_ASSOC), 'name');
foreach (['recurrence_frequency', 'recurrence_interval', 'recurrence_until'] as $required) {
    if (!in_array($required, $calendarColumns, true)) { fwrite(STDERR, "Calendar migration column {$required} is missing.\n"); exit(1); }
}
$familyColumns = array_column($database->query('PRAGMA table_info(family_members)')->fetchAll(PDO::FETCH_ASSOC), 'name');
if (!in_array('birth_date', $familyColumns, true)) { fwrite(STDERR, "Family birth_date migration column is missing.\n"); exit(1); }
foreach (['rewards', 'reward_ledger', 'shopping_lists', 'shopping_items', 'meal_recipes', 'meal_recipe_ingredients', 'meal_plan_entries'] as $table) {
    $exists = $database->query("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = '{$table}'")->fetchColumn();
    if ((int) $exists !== 1) { fwrite(STDERR, "Migration table {$table} is missing.\n"); exit(1); }
}

echo "In-memory migration smoke test passed.\n";
