<?php
declare(strict_types=1);

use FamilyCompass\Config\Config;
use FamilyCompass\Controllers\AuthController;
use FamilyCompass\Controllers\FamilyMemberController;
use FamilyCompass\Controllers\HealthController;
use FamilyCompass\Controllers\SetupController;
use FamilyCompass\Controllers\TaskController;
use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Bootstrap;
use FamilyCompass\Core\Logger;
use FamilyCompass\Core\Response;
use FamilyCompass\Core\Router;
use FamilyCompass\Repositories\AuthRepository;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\SetupRepository;
use FamilyCompass\Repositories\TaskRepository;
use FamilyCompass\Services\AuthService;
use FamilyCompass\Services\FamilyMemberService;
use FamilyCompass\Services\SetupService;
use FamilyCompass\Services\TaskService;


if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

spl_autoload_register(static function (string $class): void {
    $prefix = 'FamilyCompass\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $segments = explode('\\', substr($class, strlen($prefix)));
    $segments[0] = strtolower($segments[0]);
    $path = __DIR__ . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php';
    if (is_file($path)) {
        require $path;
    }
});

$config = new Config(dirname(__DIR__));
$logger = new Logger($config);
set_error_handler(static function (int $severity, string $message, string $file, int $line): void {
    if (!(error_reporting() & $severity)) {
        return;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

try {
    $bootstrap = new Bootstrap($config, $logger);
    $bootstrap->run();
    $database = $bootstrap->database();

    $authService = new AuthService(new AuthRepository($database));
    $authController = new AuthController($authService);
    $familyRepository = new FamilyMemberRepository($database);
    $familyController = new FamilyMemberController(new FamilyMemberService($familyRepository));
    $taskController = new TaskController(new TaskService(new TaskRepository($database), $familyRepository));
    $setupController = new SetupController(new SetupService(new SetupRepository($database)), $config->version());

    $router = new Router();
    $router->get('/v1/health', static function () use ($config, $logger): void {
        (new HealthController($config, $logger))->show();
    });
    $router->get('/v1/setup/status', static function () use ($setupController): void {
        $setupController->status();
    });
    $router->post('/v1/setup', static function () use ($setupController): void {
        $setupController->install();
    });

    $router->get('/v1/auth/profiles', static function () use ($authController): void {
        $authController->profiles();
    });
    $router->get('/v1/auth/me', static function () use ($authController): void {
        $authController->session();
    });
    $router->post('/v1/auth/login', static function () use ($authController): void {
        $authController->login();
    });
    $router->post('/v1/auth/logout', static function () use ($authService, $authController): void {
        $authService->requireUser();
        $authService->requireCsrf();
        $authController->logout();
    });

    $router->get('/v1/family-members', static function () use ($authService, $familyController): void {
        $authService->requireUser();
        $familyController->index();
    });
    $router->post('/v1/family-members', static function () use ($authService, $familyController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $familyController->create();
    });
    $router->put('/v1/family-members/{uuid}', static function (string $uuid) use ($authService, $familyController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $familyController->update($uuid);
    });
    $router->delete('/v1/family-members/{uuid}', static function (string $uuid) use ($authService, $familyController): void {
        $user = $authService->requireAdult();
        $authService->requireCsrf();
        if ($user['id'] === $uuid) {
            throw new AppException('SELF_DELETE_FORBIDDEN', 'Das aktuell angemeldete Profil kann nicht gelöscht werden.', 409);
        }
        $familyController->delete($uuid);
    });

    $router->get('/v1/tasks', static function () use ($authService, $taskController): void {
        $authService->requireUser();
        $taskController->index();
    });
    $router->post('/v1/tasks', static function () use ($authService, $taskController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $taskController->create();
    });
    $router->post('/v1/tasks/{uuid}/complete', static function (string $uuid) use ($authService, $taskController): void {
        $user = $authService->requireUser();
        $authService->requireCsrf();
        $taskController->complete($uuid, $user);
    });
    $router->put('/v1/tasks/{uuid}', static function (string $uuid) use ($authService, $taskController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $taskController->update($uuid);
    });
    $router->delete('/v1/tasks/{uuid}', static function (string $uuid) use ($authService, $taskController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $taskController->delete($uuid);
    });

    $router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/');
} catch (AppException $exception) {
    $logger->warning($exception->getMessage(), ['code' => $exception->errorCode()]);
    Response::error($exception->errorCode(), $exception->getMessage(), $exception->statusCode());
} catch (Throwable $exception) {
    $logger->error('Unhandled application error', ['type' => $exception::class, 'message' => $exception->getMessage()]);
    Response::error('INTERNAL_ERROR', 'Ein unerwarteter Fehler ist aufgetreten.', 500);
}
