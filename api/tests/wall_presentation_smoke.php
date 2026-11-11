<?php
declare(strict_types=1);

use FamilyCompass\Config\Config;
use FamilyCompass\Repositories\WallPresentationRepository;
use FamilyCompass\Services\WallPresentationService;
use FamilyCompass\Services\WeatherService;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\';
    if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) { require $path; }
});

$database = new PDO('sqlite::memory:');
$database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$database->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$database->exec('PRAGMA foreign_keys = ON');
$files = glob($apiPath . '/database/migrations/*.sql') ?: []; sort($files, SORT_NATURAL);
foreach ($files as $file) { $database->exec((string) file_get_contents($file)); }

$repository = new WallPresentationRepository($database);
$service = new WallPresentationService($repository, new WeatherService(), new Config(dirname($apiPath)));
$initial = $service->administration();
if ($initial['greeting'] !== 'Schön, dass ihr da seid' || $initial['weatherEnabled'] !== false || $initial['photos'] !== []) {
    fwrite(STDERR, "Wall presentation defaults smoke test failed.\n"); exit(1);
}
$updated = $service->update(['greeting' => 'Willkommen zu Hause', 'weatherEnabled' => false, 'weatherLocation' => '']);
if ($updated['greeting'] !== 'Willkommen zu Hause' || $updated['weatherLocation'] !== null) {
    fwrite(STDERR, "Wall presentation update smoke test failed.\n"); exit(1);
}
$presentation = $service->presentation();
if ($presentation['weather'] !== null || $presentation['photos'] !== []) {
    fwrite(STDERR, "Wall presentation payload smoke test failed.\n"); exit(1);
}

echo "Wall presentation smoke test passed.\n";
