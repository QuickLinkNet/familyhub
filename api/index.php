<?php
declare(strict_types=1);

use FamilyCompass\Config\Config;
use FamilyCompass\Controllers\AuthController;
use FamilyCompass\Controllers\CalendarController;
use FamilyCompass\Controllers\CalendarSourceController;
use FamilyCompass\Controllers\FamilyMemberController;
use FamilyCompass\Controllers\HealthController;
use FamilyCompass\Controllers\GoogleCalendarController;
use FamilyCompass\Controllers\RewardController;
use FamilyCompass\Controllers\SetupController;
use FamilyCompass\Controllers\TaskController;
use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Bootstrap;
use FamilyCompass\Core\CalendarSourceCipher;
use FamilyCompass\Core\Logger;
use FamilyCompass\Core\PublicUrl;
use FamilyCompass\Core\Response;
use FamilyCompass\Core\Router;
use FamilyCompass\Core\SecretCipher;
use FamilyCompass\Repositories\AuthRepository;
use FamilyCompass\Repositories\CalendarRepository;
use FamilyCompass\Repositories\CalendarSourceRepository;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\GoogleCalendarRepository;
use FamilyCompass\Repositories\GoogleOAuthRepository;
use FamilyCompass\Repositories\RewardRepository;
use FamilyCompass\Repositories\SetupRepository;
use FamilyCompass\Repositories\TaskRepository;
use FamilyCompass\Services\AuthService;
use FamilyCompass\Services\CalendarService;
use FamilyCompass\Services\CalendarSourceService;
use FamilyCompass\Services\FamilyMemberService;
use FamilyCompass\Services\GoogleApiClient;
use FamilyCompass\Services\GoogleCalendarService;
use FamilyCompass\Services\GoogleOAuthService;
use FamilyCompass\Services\RewardService;
use FamilyCompass\Services\SetupService;
use FamilyCompass\Services\TaskService;
use FamilyCompass\Services\IcalFetcher;
use FamilyCompass\Services\IcalParser;


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
    $calendarSourceRepository = new CalendarSourceRepository($database);
    $calendarSourceService = new CalendarSourceService(
        $calendarSourceRepository,
        new CalendarSourceCipher($config),
        new IcalFetcher(),
        new IcalParser()
    );
    $secretCipher = new SecretCipher($config);
    $googleClient = new GoogleApiClient();
    $googleOAuthService = new GoogleOAuthService(new GoogleOAuthRepository($database), $secretCipher, $googleClient);
    $googleCalendarService = new GoogleCalendarService(new GoogleCalendarRepository($database), $googleOAuthService, $googleClient, $secretCipher);
    $calendarController = new CalendarController(new CalendarService(new CalendarRepository($database), $calendarSourceRepository, $calendarSourceService, $googleCalendarService));
    $calendarSourceController = new CalendarSourceController($calendarSourceService);
    $googleCalendarController = new GoogleCalendarController($googleOAuthService, $googleCalendarService, new PublicUrl());
    $familyRepository = new FamilyMemberRepository($database);
    $familyController = new FamilyMemberController(new FamilyMemberService($familyRepository));
    $taskController = new TaskController(new TaskService(new TaskRepository($database), $familyRepository));
    $rewardController = new RewardController(new RewardService(new RewardRepository($database), $familyRepository));
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
    $router->get('/v1/google-calendar/oauth/callback', static function () use ($googleCalendarController): void {
        $googleCalendarController->callback();
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
    $router->post('/v1/tasks/{uuid}/verify', static function (string $uuid) use ($authService, $taskController): void {
        $user = $authService->requireAdult();
        $authService->requireCsrf();
        $taskController->verify($uuid, $user);
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
    $router->get('/v1/rewards', static function () use ($authService, $rewardController): void {
        $authService->requireUser();
        $rewardController->index();
    });
    $router->post('/v1/rewards', static function () use ($authService, $rewardController): void {
        $actor = $authService->requireAdult();
        $authService->requireCsrf();
        $rewardController->create($actor);
    });
    $router->post('/v1/rewards/bonus', static function () use ($authService, $rewardController): void {
        $actor = $authService->requireAdult();
        $authService->requireCsrf();
        $rewardController->bonus($actor);
    });
    $router->post('/v1/rewards/{uuid}/redeem', static function (string $uuid) use ($authService, $rewardController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $rewardController->redeem($uuid, $actor);
    });
    $router->delete('/v1/rewards/{uuid}', static function (string $uuid) use ($authService, $rewardController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $rewardController->delete($uuid);
    });
    $router->get('/v1/calendars', static function () use ($authService, $calendarController): void {
        $authService->requireUser();
        $calendarController->calendars();
    });
    $router->get('/v1/calendar-events', static function () use ($authService, $calendarController): void {
        $authService->requireUser();
        $calendarController->events();
    });
    $router->post('/v1/calendar-events', static function () use ($authService, $calendarController): void {
        $actor = $authService->requireAdult();
        $authService->requireCsrf();
        $calendarController->create($actor);
    });
    $router->put('/v1/calendar-events/{uuid}', static function (string $uuid) use ($authService, $calendarController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $calendarController->update($uuid);
    });
    $router->delete('/v1/calendar-events/{uuid}', static function (string $uuid) use ($authService, $calendarController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $calendarController->delete($uuid);
    });
    $router->get('/v1/admin/calendar-sources', static function () use ($authService, $calendarSourceController): void {
        $authService->requireAdmin();
        $calendarSourceController->index();
    });
    $router->post('/v1/admin/calendar-sources', static function () use ($authService, $calendarSourceController): void {
        $actor = $authService->requireAdmin();
        $authService->requireCsrf();
        $calendarSourceController->create($actor);
    });
    $router->put('/v1/admin/calendar-sources/{uuid}', static function (string $uuid) use ($authService, $calendarSourceController): void {
        $authService->requireAdmin();
        $authService->requireCsrf();
        $calendarSourceController->update($uuid);
    });
    $router->post('/v1/admin/calendar-sources/{uuid}/sync', static function (string $uuid) use ($authService, $calendarSourceController): void {
        $authService->requireAdmin();
        $authService->requireCsrf();
        $calendarSourceController->synchronize($uuid);
    });
    $router->delete('/v1/admin/calendar-sources/{uuid}', static function (string $uuid) use ($authService, $calendarSourceController): void {
        $authService->requireAdmin();
        $authService->requireCsrf();
        $calendarSourceController->delete($uuid);
    });
    $router->get('/v1/admin/google-calendar', static function () use ($authService, $googleCalendarController): void {
        $authService->requireAdmin();
        $googleCalendarController->status();
    });
    $router->put('/v1/admin/google-calendar/config', static function () use ($authService, $googleCalendarController): void {
        $authService->requireAdmin();
        $authService->requireCsrf();
        $googleCalendarController->configure();
    });
    $router->post('/v1/admin/google-calendar/authorize', static function () use ($authService, $googleCalendarController): void {
        $authService->requireAdmin();
        $authService->requireCsrf();
        $googleCalendarController->authorize();
    });
    $router->put('/v1/admin/google-calendar/sources/{uuid}', static function (string $uuid) use ($authService, $googleCalendarController): void {
        $authService->requireAdmin();
        $authService->requireCsrf();
        $googleCalendarController->updateSource($uuid);
    });
    $router->post('/v1/admin/google-calendar/sources/{uuid}/sync', static function (string $uuid) use ($authService, $googleCalendarController): void {
        $authService->requireAdmin();
        $authService->requireCsrf();
        $googleCalendarController->synchronize($uuid);
    });
    $router->delete('/v1/admin/google-calendar', static function () use ($authService, $googleCalendarController): void {
        $authService->requireAdmin();
        $authService->requireCsrf();
        $googleCalendarController->disconnect();
    });

    $router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/');
} catch (AppException $exception) {
    $logger->warning($exception->getMessage(), ['code' => $exception->errorCode()]);
    Response::error($exception->errorCode(), $exception->getMessage(), $exception->statusCode());
} catch (Throwable $exception) {
    $logger->error('Unhandled application error', ['type' => $exception::class, 'message' => $exception->getMessage()]);
    Response::error('INTERNAL_ERROR', 'Ein unerwarteter Fehler ist aufgetreten.', 500);
}
