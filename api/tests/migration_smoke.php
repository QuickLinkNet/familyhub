<?php
declare(strict_types=1);

use FamilyCompass\Config\Config;
use FamilyCompass\Core\Bootstrap;
use FamilyCompass\Core\Logger;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\';
    if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix)));
    $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) { require $path; }
});

$config = new Config(dirname($apiPath));
$logger = new Logger($config);
(new Bootstrap($config, $logger))->run();
(new Bootstrap($config, $logger))->run();

$pdo = new PDO('sqlite:' . $config->databasePath());
$migrations = (int) $pdo->query('SELECT COUNT(*) FROM schema_migrations')->fetchColumn();
$settings = (int) $pdo->query('SELECT COUNT(*) FROM app_settings')->fetchColumn();
$expectedMigrations = count(glob($config->migrationsPath() . DIRECTORY_SEPARATOR . '*.sql') ?: []);

if ($migrations !== $expectedMigrations || $settings !== 1) {
    fwrite(STDERR, "Migration smoke test failed.\n");
    exit(1);
}

echo "Migration smoke test passed.\n";