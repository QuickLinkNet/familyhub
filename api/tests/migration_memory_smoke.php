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
foreach (['routine_period', 'repeat_days', 'series_uuid'] as $required) {
    if (!in_array($required, $names, true)) {
        fwrite(STDERR, "Migration column {$required} is missing.\n");
        exit(1);
    }
}

echo "In-memory migration smoke test passed.\n";
