<?php
declare(strict_types=1);

namespace FamilyCompass\Routes;

use FamilyCompass\Controllers\CalendarController;
use FamilyCompass\Core\Router;
use FamilyCompass\Services\AuthService;

final class CalendarRoutes
{
    public static function register(Router $router, AuthService $auth, CalendarController $calendar): void
    {
        $router->get('/v1/calendars', static function () use ($auth, $calendar): void {
            $auth->requireUser(); $calendar->calendars();
        });
        $router->get('/v1/calendar-events', static function () use ($auth, $calendar): void {
            $calendar->events($auth->requireUser());
        });
        $router->post('/v1/calendar-events', static function () use ($auth, $calendar): void {
            $actor = $auth->requireAdult(); $auth->requireCsrf(); $calendar->create($actor);
        });
        $router->put('/v1/calendar-events/{uuid}', static function (string $uuid) use ($auth, $calendar): void {
            $auth->requireAdult(); $auth->requireCsrf(); $calendar->update($uuid);
        });
        $router->delete('/v1/calendar-events/{uuid}', static function (string $uuid) use ($auth, $calendar): void {
            $auth->requireAdult(); $auth->requireCsrf(); $calendar->delete($uuid);
        });
    }
}
