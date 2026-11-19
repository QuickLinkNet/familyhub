<?php
declare(strict_types=1);

namespace FamilyHub\Routes;

use FamilyHub\Controllers\AuthController;
use FamilyHub\Core\Router;
use FamilyHub\Services\AuthService;

final class CompanionRoutes
{
    public static function register(Router $router, AuthService $auth, AuthController $controller): void
    {
        $router->post('/v1/auth/invitations', static function () use ($auth, $controller): void {
            $actor = $auth->requireAdult(); $auth->requireCsrf(); $controller->createInvitation($actor);
        });
        $router->get('/v1/auth/invitations/{token}', static function (string $token) use ($controller): void {
            $controller->invitation($token);
        });
        $router->post('/v1/auth/invitations/{token}/redeem', static function (string $token) use ($controller): void {
            $controller->redeemInvitation($token);
        });
        $router->get('/v1/admin/devices', static function () use ($auth, $controller): void {
            $auth->requireAdmin(); $controller->devices();
        });
        $router->delete('/v1/admin/devices/{uuid}', static function (string $uuid) use ($auth, $controller): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $controller->revokeDevice($uuid);
        });
    }
}
