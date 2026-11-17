<?php
declare(strict_types=1);

namespace FamilyHub\Routes;

use FamilyHub\Controllers\CalendarController;
use FamilyHub\Core\Router;
use FamilyHub\Services\AuthService;

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
