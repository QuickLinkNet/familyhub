<?php
declare(strict_types=1);

namespace FamilyHub\Routes;

use FamilyHub\Controllers\MealController;
use FamilyHub\Core\Router;
use FamilyHub\Services\AuthService;

final class MealRoutes
{
    public static function register(Router $router, AuthService $auth, MealController $controller): void
    {
        $router->get('/v1/meal-planner', static function () use ($auth, $controller): void {
            $auth->requireUser(); $controller->index();
        });
        $router->post('/v1/meal-recipes', static function () use ($auth, $controller): void {
            $actor = $auth->requireAdult(); $auth->requireCsrf(); $controller->createRecipe($actor);
        });
        $router->put('/v1/meal-recipes/{uuid}', static function (string $uuid) use ($auth, $controller): void {
            $auth->requireAdult(); $auth->requireCsrf(); $controller->updateRecipe($uuid);
        });
        $router->delete('/v1/meal-recipes/{uuid}', static function (string $uuid) use ($auth, $controller): void {
            $auth->requireAdult(); $auth->requireCsrf(); $controller->deleteRecipe($uuid);
        });
        $router->post('/v1/meal-recipes/{uuid}/add-to-shopping', static function (string $uuid) use ($auth, $controller): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $controller->addToShopping($uuid, $actor);
        });
        $router->post('/v1/meal-plan', static function () use ($auth, $controller): void {
            $actor = $auth->requireAdult(); $auth->requireCsrf(); $controller->plan($actor);
        });
        $router->delete('/v1/meal-plan/{uuid}', static function (string $uuid) use ($auth, $controller): void {
            $auth->requireAdult(); $auth->requireCsrf(); $controller->deleteEntry($uuid);
        });
    }
}
