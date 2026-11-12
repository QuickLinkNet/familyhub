<?php
declare(strict_types=1);

use FamilyCompass\Config\Config;
use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Bootstrap;
use FamilyCompass\Core\Logger;
use FamilyCompass\Repositories\SetupRepository;
use FamilyCompass\Services\SetupService;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\';
    if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix)));
    $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) { require $path; }
});

function removeTree(string $path): void
{
    if (!is_dir($path)) { return; }
    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST,
    );
    foreach ($items as $item) {
        $item->isDir() ? rmdir($item->getPathname()) : unlink($item->getPathname());
    }
    rmdir($path);
}

$temporaryRoot = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'familyhub-setup-' . bin2hex(random_bytes(8));
$migrationTarget = $temporaryRoot . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'migrations';
if (!mkdir($migrationTarget, 0775, true) && !is_dir($migrationTarget)) {
    throw new RuntimeException('Temporary migration directory unavailable.');
}
foreach (glob($apiPath . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'migrations' . DIRECTORY_SEPARATOR . '*.sql') ?: [] as $migration) {
    copy($migration, $migrationTarget . DIRECTORY_SEPARATOR . basename($migration));
}

try {
    $config = new Config($temporaryRoot);
    $logger = new Logger($config);
    $bootstrap = new Bootstrap($config, $logger);
    $bootstrap->run();
    $database = $bootstrap->database();
    $service = new SetupService(new SetupRepository($database));

    if ($service->status('test')['required'] !== true) {
        throw new RuntimeException('Fresh installation did not request setup.');
    }

    $adultPassword = 'Test-' . bin2hex(random_bytes(8));
    $summary = $service->install([
        'householdName' => 'Testhaushalt',
        'locale' => 'de-DE',
        'timezone' => 'Europe/Berlin',
        'members' => [
            ['name' => 'Erwachsen', 'role' => 'ADMIN', 'color' => '#345B48', 'password' => $adultPassword],
            ['name' => 'Kind', 'role' => 'CHILD', 'color' => '#6A82B8', 'pin' => '1234'],
        ],
    ]);

    if (count($summary['members'] ?? []) !== 2 || count($summary['calendars'] ?? []) !== 3) {
        throw new RuntimeException('Setup summary is incomplete.');
    }
    $adultHash = (string) $database->query("SELECT password_hash FROM family_members WHERE role = 'ADMIN'")->fetchColumn();
    $childHash = (string) $database->query("SELECT pin_hash FROM family_members WHERE role = 'CHILD'")->fetchColumn();
    if (!password_verify($adultPassword, $adultHash) || !password_verify('1234', $childHash)) {
        throw new RuntimeException('Setup credentials were not hashed correctly.');
    }
    if ($service->status('test')['completed'] !== true) {
        throw new RuntimeException('Completed installation was not detected.');
    }

    try {
        $service->install([]);
        throw new RuntimeException('A second setup was unexpectedly accepted.');
    } catch (AppException $error) {
        if ($error->errorCode() !== 'SETUP_ALREADY_COMPLETED' || $error->statusCode() !== 409) {
            throw $error;
        }
    }

    echo "Setup smoke test passed.\n";
} finally {
    $service = null;
    $database = null;
    $bootstrap = null;
    $logger = null;
    $config = null;
    removeTree($temporaryRoot);
}
