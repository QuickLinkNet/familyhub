<?php
declare(strict_types=1);

use FamilyHub\Config\Config;
use FamilyHub\Controllers\AuthController;
use FamilyHub\Controllers\AdminArchiveController;
use FamilyHub\Controllers\AdminBackupController;
use FamilyHub\Controllers\CalendarController;
use FamilyHub\Controllers\CalendarSourceController;
use FamilyHub\Controllers\FamilyMemberController;
use FamilyHub\Controllers\FamilyGoalController;
use FamilyHub\Controllers\FamilyListController;
use FamilyHub\Controllers\FamilyNoteController;
use FamilyHub\Controllers\HealthController;
use FamilyHub\Controllers\GoogleCalendarController;
use FamilyHub\Controllers\HouseholdChoreController;
use FamilyHub\Controllers\MealController;
use FamilyHub\Controllers\PushController;
use FamilyHub\Controllers\ReminderController;
use FamilyHub\Controllers\RewardController;
use FamilyHub\Controllers\RoutineController;
use FamilyHub\Controllers\SchoolController;
use FamilyHub\Controllers\SetupController;
use FamilyHub\Controllers\ShoppingController;
use FamilyHub\Controllers\TaskController;
use FamilyHub\Controllers\WallPresentationController;
use FamilyHub\Core\AppException;
use FamilyHub\Core\BackupService;
use FamilyHub\Core\Bootstrap;
use FamilyHub\Core\CalendarSourceCipher;
use FamilyHub\Core\Logger;
use FamilyHub\Core\PortableArchiveService;
use FamilyHub\Core\PublicUrl;
use FamilyHub\Core\Response;
use FamilyHub\Core\Router;
use FamilyHub\Core\SecretCipher;
use FamilyHub\Repositories\AuthRepository;
use FamilyHub\Repositories\CalendarRepository;
use FamilyHub\Repositories\CalendarSourceRepository;
use FamilyHub\Repositories\FamilyMemberRepository;
use FamilyHub\Repositories\FamilyGoalRepository;
use FamilyHub\Repositories\FamilyListRepository;
use FamilyHub\Repositories\FamilyNoteRepository;
use FamilyHub\Repositories\GoogleCalendarRepository;
use FamilyHub\Repositories\GoogleOAuthRepository;
use FamilyHub\Repositories\HouseholdChoreRepository;
use FamilyHub\Repositories\MealRepository;
use FamilyHub\Repositories\PushRepository;
use FamilyHub\Repositories\RewardRepository;
use FamilyHub\Repositories\RoutineRepository;
use FamilyHub\Repositories\SchoolRepository;
use FamilyHub\Repositories\SetupRepository;
use FamilyHub\Repositories\ShoppingRepository;
use FamilyHub\Repositories\TaskRepository;
use FamilyHub\Repositories\WallPresentationRepository;
use FamilyHub\Routes\AdminRoutes;
use FamilyHub\Routes\CalendarRoutes;
use FamilyHub\Routes\CompanionRoutes;
use FamilyHub\Routes\FamilyListRoutes;
use FamilyHub\Routes\MealRoutes;
use FamilyHub\Routes\PushRoutes;
use FamilyHub\Services\AuthService;
use FamilyHub\Services\AdminArchiveService;
use FamilyHub\Services\AdminBackupService;
use FamilyHub\Services\CalendarService;
use FamilyHub\Services\CalendarRecurrenceExpander;
use FamilyHub\Services\BirthdayEventFactory;
use FamilyHub\Services\CalendarSourceService;
use FamilyHub\Services\FamilyMemberService;
use FamilyHub\Services\FamilyGoalService;
use FamilyHub\Services\FamilyListService;
use FamilyHub\Services\FamilyNoteService;
use FamilyHub\Services\GoogleApiClient;
use FamilyHub\Services\GoogleCalendarService;
use FamilyHub\Services\GoogleOAuthService;
use FamilyHub\Services\HouseholdChoreService;
use FamilyHub\Services\MealService;
use FamilyHub\Services\PushService;
use FamilyHub\Services\ReminderPlanner;
use FamilyHub\Services\ReminderService;
use FamilyHub\Services\RewardService;
use FamilyHub\Services\RoutineService;
use FamilyHub\Services\SchoolService;
use FamilyHub\Services\SetupService;
use FamilyHub\Services\ShoppingService;
use FamilyHub\Services\TaskService;
use FamilyHub\Services\WallPresentationService;
use FamilyHub\Services\WeatherService;
use FamilyHub\Services\WebPushCrypto;
use FamilyHub\Services\IcalFetcher;
use FamilyHub\Services\IcalParser;
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

spl_autoload_register(static function (string $class): void {
    $prefix = 'FamilyHub\\';
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

    $authService = new AuthService(new AuthRepository($database), new PublicUrl());
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
    $familyRepository = new FamilyMemberRepository($database);
    $calendarService = new CalendarService(
        new CalendarRepository($database),
        $calendarSourceRepository,
        $calendarSourceService,
        $googleCalendarService,
        $familyRepository,
        new CalendarRecurrenceExpander(),
        new BirthdayEventFactory()
    );
    $calendarController = new CalendarController($calendarService);
    $calendarSourceController = new CalendarSourceController($calendarSourceService);
    $googleCalendarController = new GoogleCalendarController($googleOAuthService, $googleCalendarService, new PublicUrl());
    $familyController = new FamilyMemberController(new FamilyMemberService($familyRepository));
    $familyGoalController = new FamilyGoalController(new FamilyGoalService(new FamilyGoalRepository($database)));
    $familyListController = new FamilyListController(new FamilyListService(new FamilyListRepository($database), $familyRepository));
    $familyNoteController = new FamilyNoteController(new FamilyNoteService(new FamilyNoteRepository($database)));
    $taskRepository = new TaskRepository($database);
    $taskService = new TaskService($taskRepository, $familyRepository);
    $taskController = new TaskController($taskService);
    $routineService = new RoutineService(new RoutineRepository($database), $familyRepository);
    $routineController = new RoutineController($routineService);
    $rewardController = new RewardController(new RewardService(new RewardRepository($database), $familyRepository));
    $shoppingRepository = new ShoppingRepository($database);
    $shoppingController = new ShoppingController(new ShoppingService($shoppingRepository));
    $mealController = new MealController(new MealService(new MealRepository($database), $shoppingRepository));
    $schoolService = new SchoolService(new SchoolRepository($database), $familyRepository);
    $schoolController = new SchoolController($schoolService);
    $reminderService = new ReminderService($calendarService, $taskService, $routineService, $schoolService, $taskRepository, new ReminderPlanner());
    $reminderController = new ReminderController($reminderService);
    $pushService = new PushService(new PushRepository($database), $familyRepository, $reminderService, $secretCipher, new WebPushCrypto(), new PublicUrl());
    $pushController = new PushController($pushService);
    $householdChoreController = new HouseholdChoreController(new HouseholdChoreService(new HouseholdChoreRepository($database), $familyRepository));
    $wallPresentationController = new WallPresentationController(new WallPresentationService(new WallPresentationRepository($database), new WeatherService(), $config));
    $backupService = new BackupService($config, $logger);
    $adminBackupController = new AdminBackupController(new AdminBackupService($backupService, $database));
    $adminArchiveController = new AdminArchiveController(new AdminArchiveService(new PortableArchiveService($config, $logger, $backupService), $database));
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
    CompanionRoutes::register($router, $authService, $authController);
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
    $router->get('/v1/reminders', static function () use ($authService, $reminderController): void {
        $reminderController->index($authService->requireUser());
    });
    PushRoutes::register($router, $authService, $pushController);
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
    $router->get('/v1/family-goals', static function () use ($authService, $familyGoalController): void {
        $authService->requireUser();
        $familyGoalController->index();
    });
    $router->post('/v1/family-goals', static function () use ($authService, $familyGoalController): void {
        $actor = $authService->requireAdult();
        $authService->requireCsrf();
        $familyGoalController->create($actor);
    });
    $router->put('/v1/family-goals/{uuid}', static function (string $uuid) use ($authService, $familyGoalController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $familyGoalController->update($uuid);
    });
    $router->post('/v1/family-goals/{uuid}/contribute', static function (string $uuid) use ($authService, $familyGoalController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $familyGoalController->contribute($uuid, $actor);
    });
    $router->delete('/v1/family-goals/{uuid}', static function (string $uuid) use ($authService, $familyGoalController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $familyGoalController->delete($uuid);
    });
    $router->get('/v1/family-notes', static function () use ($authService, $familyNoteController): void {
        $authService->requireUser();
        $familyNoteController->index();
    });
    $router->post('/v1/family-notes', static function () use ($authService, $familyNoteController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $familyNoteController->create($actor);
    });
    $router->put('/v1/family-notes/{uuid}', static function (string $uuid) use ($authService, $familyNoteController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $familyNoteController->update($uuid, $actor);
    });
    $router->delete('/v1/family-notes/{uuid}', static function (string $uuid) use ($authService, $familyNoteController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $familyNoteController->delete($uuid, $actor);
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
    $router->get('/v1/routines', static function () use ($authService, $routineController): void {
        $authService->requireUser();
        $routineController->index();
    });
    $router->post('/v1/routines', static function () use ($authService, $routineController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $routineController->create();
    });
    $router->put('/v1/routines/{uuid}', static function (string $uuid) use ($authService, $routineController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $routineController->update($uuid);
    });
    $router->delete('/v1/routines/{uuid}', static function (string $uuid) use ($authService, $routineController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $routineController->delete($uuid);
    });
    $router->post('/v1/routine-runs/{runUuid}/steps/{stepUuid}/complete', static function (string $runUuid, string $stepUuid) use ($authService, $routineController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $routineController->completeStep($runUuid, $stepUuid, $actor);
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
    $router->get('/v1/shopping-lists', static function () use ($authService, $shoppingController): void {
        $authService->requireUser();
        $shoppingController->index();
    });
    $router->post('/v1/shopping-lists', static function () use ($authService, $shoppingController): void {
        $actor = $authService->requireAdult();
        $authService->requireCsrf();
        $shoppingController->createList($actor);
    });
    $router->post('/v1/shopping-lists/{uuid}/items', static function (string $uuid) use ($authService, $shoppingController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $shoppingController->createItem($uuid, $actor);
    });
    $router->post('/v1/shopping-lists/{uuid}/clear-checked', static function (string $uuid) use ($authService, $shoppingController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $shoppingController->clearChecked($uuid);
    });
    $router->delete('/v1/shopping-lists/{uuid}', static function (string $uuid) use ($authService, $shoppingController): void {
        $authService->requireAdult();
        $authService->requireCsrf();
        $shoppingController->deleteList($uuid);
    });
    $router->put('/v1/shopping-items/{uuid}', static function (string $uuid) use ($authService, $shoppingController): void {
        $authService->requireUser();
        $authService->requireCsrf();
        $shoppingController->updateItem($uuid);
    });
    $router->post('/v1/shopping-items/{uuid}/toggle', static function (string $uuid) use ($authService, $shoppingController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $shoppingController->toggle($uuid, $actor);
    });
    $router->delete('/v1/shopping-items/{uuid}', static function (string $uuid) use ($authService, $shoppingController): void {
        $authService->requireUser();
        $authService->requireCsrf();
        $shoppingController->deleteItem($uuid);
    });
    $router->get('/v1/school-board', static function () use ($authService, $schoolController): void {
        $authService->requireUser();
        $schoolController->index();
    });
    $router->post('/v1/school-lessons', static function () use ($authService, $schoolController): void {
        $actor = $authService->requireAdult();
        $authService->requireCsrf();
        $schoolController->createLesson($actor);
    });
    $router->put('/v1/school-lessons/{uuid}', static function (string $uuid) use ($authService, $schoolController): void {
        $actor = $authService->requireAdult();
        $authService->requireCsrf();
        $schoolController->updateLesson($uuid, $actor);
    });
    $router->delete('/v1/school-lessons/{uuid}', static function (string $uuid) use ($authService, $schoolController): void {
        $actor = $authService->requireAdult();
        $authService->requireCsrf();
        $schoolController->deleteLesson($uuid, $actor);
    });
    $router->post('/v1/school-items', static function () use ($authService, $schoolController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $schoolController->createItem($actor);
    });
    $router->put('/v1/school-items/{uuid}', static function (string $uuid) use ($authService, $schoolController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $schoolController->updateItem($uuid, $actor);
    });
    $router->post('/v1/school-items/{uuid}/toggle', static function (string $uuid) use ($authService, $schoolController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $schoolController->toggleItem($uuid, $actor);
    });
    $router->delete('/v1/school-items/{uuid}', static function (string $uuid) use ($authService, $schoolController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $schoolController->deleteItem($uuid, $actor);
    });
    $router->get('/v1/household-chores', static function () use ($authService, $householdChoreController): void {
        $authService->requireUser();
        $householdChoreController->index();
    });
    $router->post('/v1/household-chores', static function () use ($authService, $householdChoreController): void {
        $actor = $authService->requireAdult();
        $authService->requireCsrf();
        $householdChoreController->create($actor);
    });
    $router->put('/v1/household-chores/{uuid}', static function (string $uuid) use ($authService, $householdChoreController): void {
        $actor = $authService->requireAdult();
        $authService->requireCsrf();
        $householdChoreController->update($uuid, $actor);
    });
    $router->post('/v1/household-chores/{uuid}/complete', static function (string $uuid) use ($authService, $householdChoreController): void {
        $actor = $authService->requireUser();
        $authService->requireCsrf();
        $householdChoreController->complete($uuid, $actor);
    });
    $router->delete('/v1/household-chores/{uuid}', static function (string $uuid) use ($authService, $householdChoreController): void {
        $actor = $authService->requireAdult();
        $authService->requireCsrf();
        $householdChoreController->delete($uuid, $actor);
    });
    $router->get('/v1/wall-presentation', static function () use ($authService, $wallPresentationController): void {
        $authService->requireUser();
        $wallPresentationController->show();
    });
    $router->get('/v1/wall-photos/{uuid}', static function (string $uuid) use ($authService, $wallPresentationController): void {
        $authService->requireUser();
        $wallPresentationController->photo($uuid);
    });
    CalendarRoutes::register($router, $authService, $calendarController);
    FamilyListRoutes::register($router, $authService, $familyListController);
    MealRoutes::register($router, $authService, $mealController);
    AdminRoutes::register($router, $authService, $wallPresentationController, $calendarSourceController, $googleCalendarController, $adminBackupController, $adminArchiveController);

    $router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/');
} catch (AppException $exception) {
    $logger->warning($exception->getMessage(), ['code' => $exception->errorCode()]);
    Response::error($exception->errorCode(), $exception->getMessage(), $exception->statusCode());
} catch (Throwable $exception) {
    $logger->error('Unhandled application error', ['type' => $exception::class, 'message' => $exception->getMessage()]);
    Response::error('INTERNAL_ERROR', 'Ein unerwarteter Fehler ist aufgetreten.', 500);
}
