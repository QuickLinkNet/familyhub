<?php
declare(strict_types=1);

namespace FamilyHub\Routes;

use FamilyHub\Controllers\FamilyListController;
use FamilyHub\Core\Router;
use FamilyHub\Services\AuthService;

final class FamilyListRoutes
{
    public static function register(Router $router, AuthService $auth, FamilyListController $controller): void
    {
        $router->get('/v1/lists', static function () use ($auth, $controller): void {
            $controller->index($auth->requireUser());
        });
        $router->post('/v1/lists', static function () use ($auth, $controller): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $controller->createList($actor);
        });
        $router->put('/v1/lists/{uuid}', static function (string $uuid) use ($auth, $controller): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $controller->updateList($uuid, $actor);
        });
        $router->delete('/v1/lists/{uuid}', static function (string $uuid) use ($auth, $controller): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $controller->deleteList($uuid, $actor);
        });
        $router->post('/v1/lists/{uuid}/items', static function (string $uuid) use ($auth, $controller): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $controller->createItem($uuid, $actor);
        });
        $router->post('/v1/lists/{uuid}/clear-completed', static function (string $uuid) use ($auth, $controller): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $controller->clearCompleted($uuid, $actor);
        });
        $router->put('/v1/list-items/{uuid}', static function (string $uuid) use ($auth, $controller): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $controller->updateItem($uuid, $actor);
        });
        $router->post('/v1/list-items/{uuid}/toggle', static function (string $uuid) use ($auth, $controller): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $controller->toggleItem($uuid, $actor);
        });
        $router->delete('/v1/list-items/{uuid}', static function (string $uuid) use ($auth, $controller): void {
            $actor = $auth->requireUser(); $auth->requireCsrf(); $controller->deleteItem($uuid, $actor);
        });
    }
}
