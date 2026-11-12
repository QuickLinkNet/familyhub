<?php
declare(strict_types=1);

namespace FamilyCompass\Routes;

use FamilyCompass\Controllers\PushController;
use FamilyCompass\Core\Router;
use FamilyCompass\Services\AuthService;

final class PushRoutes
{
    public static function register(Router $router, AuthService $auth, PushController $push): void
    {
        $router->get('/v1/push/status', static function () use ($auth, $push): void {
            $push->status($auth->requireUser());
        });
        $router->post('/v1/push/subscriptions', static function () use ($auth, $push): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $push->subscribe($actor);
        });
        $router->post('/v1/push/unsubscribe', static function () use ($auth, $push): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $push->unsubscribe($actor);
        });
        $router->post('/v1/push/test', static function () use ($auth, $push): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $push->test($actor);
        });
        $router->get('/v1/admin/push', static function () use ($auth, $push): void {
            $auth->requireAdmin(); $push->administration();
        });
        $router->post('/v1/admin/push/dispatch', static function () use ($auth, $push): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $push->dispatch();
        });
        $router->get('/v1/push/dispatch', static function () use ($push): void {
            $push->scheduledDispatch();
        });
    }
}
