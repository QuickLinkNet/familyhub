<?php
declare(strict_types=1);

use FamilyCompass\Config\Config;
use FamilyCompass\Controllers\FamilyMemberController;
use FamilyCompass\Controllers\HealthController;
use FamilyCompass\Controllers\TaskController;
use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Bootstrap;
use FamilyCompass\Core\Logger;
use FamilyCompass\Core\Response;
use FamilyCompass\Core\Router;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\TaskRepository;
use FamilyCompass\Services\FamilyMemberService;
use FamilyCompass\Services\TaskService;

spl_autoload_register(static function (string $class): void {
    $prefix = 'FamilyCompass\\';
    if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix)));
    $segments[0] = strtolower($segments[0]);
    $path = __DIR__ . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) { require $path; }
});

$config = new Config(dirname(__DIR__));
$logger = new Logger($config);
set_error_handler(static function (int $severity, string $message, string $file, int $line): void {
    if (!(error_reporting() & $severity)) { return; }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

try {
    $bootstrap = new Bootstrap($config, $logger);
    $bootstrap->run();
    $database = $bootstrap->database();
    $familyRepository = new FamilyMemberRepository($database);
    $familyController = new FamilyMemberController(new FamilyMemberService($familyRepository));
    $taskController = new TaskController(new TaskService(new TaskRepository($database), $familyRepository));
    $router = new Router();
    $router->get('/v1/health', static function () use ($config, $logger): void { (new HealthController($config, $logger))->show(); });
    $router->get('/v1/family-members', static function () use ($familyController): void { $familyController->index(); });
    $router->post('/v1/family-members', static function () use ($familyController): void { $familyController->create(); });
    $router->put('/v1/family-members/{uuid}', static function (string $uuid) use ($familyController): void { $familyController->update($uuid); });
    $router->delete('/v1/family-members/{uuid}', static function (string $uuid) use ($familyController): void { $familyController->delete($uuid); });
    $router->get('/v1/tasks', static function () use ($taskController): void { $taskController->index(); });
    $router->post('/v1/tasks', static function () use ($taskController): void { $taskController->create(); });
    $router->post('/v1/tasks/{uuid}/complete', static function (string $uuid) use ($taskController): void { $taskController->complete($uuid); });
    $router->put('/v1/tasks/{uuid}', static function (string $uuid) use ($taskController): void { $taskController->update($uuid); });
    $router->delete('/v1/tasks/{uuid}', static function (string $uuid) use ($taskController): void { $taskController->delete($uuid); });
    $router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/');
} catch (AppException $exception) {
    $logger->warning($exception->getMessage(), ['code' => $exception->errorCode()]);
    Response::error($exception->errorCode(), $exception->getMessage(), $exception->statusCode());
} catch (Throwable $exception) {
    $logger->error('Unhandled application error', ['type' => $exception::class, 'message' => $exception->getMessage()]);
    Response::error('INTERNAL_ERROR', 'Ein unerwarteter Fehler ist aufgetreten.', 500);
}