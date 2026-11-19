<?php
declare(strict_types=1);

namespace FamilyHub\Routes;

use FamilyHub\Controllers\ProfilePreferenceController;
use FamilyHub\Core\Router;
use FamilyHub\Services\AuthService;

final class ProfilePreferenceRoutes
{
    public static function register(Router $router, AuthService $auth, ProfilePreferenceController $controller): void
    {
        $router->get('/v1/profile-preferences', static function () use ($auth, $controller): void {
            $controller->show($auth->requireUser());
        });
        $router->put('/v1/profile-preferences', static function () use ($auth, $controller): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $controller->update($actor);
        });
    }
}
