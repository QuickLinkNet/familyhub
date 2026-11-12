<?php
declare(strict_types=1);

namespace FamilyCompass\Routes;

use FamilyCompass\Controllers\CalendarSourceController;
use FamilyCompass\Controllers\AdminArchiveController;
use FamilyCompass\Controllers\AdminBackupController;
use FamilyCompass\Controllers\GoogleCalendarController;
use FamilyCompass\Controllers\WallPresentationController;
use FamilyCompass\Core\Router;
use FamilyCompass\Services\AuthService;

final class AdminRoutes
{
    public static function register(
        Router $router,
        AuthService $auth,
        WallPresentationController $wall,
        CalendarSourceController $calendarSources,
        GoogleCalendarController $googleCalendar,
        AdminBackupController $backups,
        AdminArchiveController $archives
    ): void {
        $router->get('/v1/admin/archive/download', static function () use ($auth, $archives): void {
            $auth->requireAdmin(); $archives->download();
        });
        $router->post('/v1/admin/archive/restore-upload', static function () use ($auth, $archives): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $archives->restoreUpload();
        });
        $router->get('/v1/admin/backups', static function () use ($auth, $backups): void {
            $auth->requireAdmin(); $backups->index();
        });
        $router->post('/v1/admin/backups', static function () use ($auth, $backups): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $backups->create();
        });
        $router->post('/v1/admin/backups/restore-upload', static function () use ($auth, $backups): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $backups->restoreUpload();
        });
        $router->get('/v1/admin/backups/{id}/download', static function (string $id) use ($auth, $backups): void {
            $auth->requireAdmin(); $backups->download($id);
        });
        $router->post('/v1/admin/backups/{id}/restore', static function (string $id) use ($auth, $backups): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $backups->restore($id);
        });

        $router->get('/v1/admin/wall-presentation', static function () use ($auth, $wall): void {
            $auth->requireAdmin(); $wall->administration();
        });
        $router->put('/v1/admin/wall-presentation', static function () use ($auth, $wall): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $wall->update();
        });
        $router->post('/v1/admin/wall-photos', static function () use ($auth, $wall): void {
            $actor = $auth->requireAdmin(); $auth->requireCsrf(); $wall->upload($actor);
        });
        $router->delete('/v1/admin/wall-photos/{uuid}', static function (string $uuid) use ($auth, $wall): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $wall->delete($uuid);
        });

        $router->get('/v1/admin/calendar-sources', static function () use ($auth, $calendarSources): void {
            $auth->requireAdmin(); $calendarSources->index();
        });
        $router->post('/v1/admin/calendar-sources', static function () use ($auth, $calendarSources): void {
            $actor = $auth->requireAdmin(); $auth->requireCsrf(); $calendarSources->create($actor);
        });
        $router->put('/v1/admin/calendar-sources/{uuid}', static function (string $uuid) use ($auth, $calendarSources): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $calendarSources->update($uuid);
        });
        $router->post('/v1/admin/calendar-sources/{uuid}/sync', static function (string $uuid) use ($auth, $calendarSources): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $calendarSources->synchronize($uuid);
        });
        $router->delete('/v1/admin/calendar-sources/{uuid}', static function (string $uuid) use ($auth, $calendarSources): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $calendarSources->delete($uuid);
        });

        $router->get('/v1/admin/google-calendar', static function () use ($auth, $googleCalendar): void {
            $auth->requireAdmin(); $googleCalendar->status();
        });
        $router->put('/v1/admin/google-calendar/config', static function () use ($auth, $googleCalendar): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $googleCalendar->configure();
        });
        $router->post('/v1/admin/google-calendar/authorize', static function () use ($auth, $googleCalendar): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $googleCalendar->authorize();
        });
        $router->put('/v1/admin/google-calendar/sources/{uuid}', static function (string $uuid) use ($auth, $googleCalendar): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $googleCalendar->updateSource($uuid);
        });
        $router->post('/v1/admin/google-calendar/sources/{uuid}/sync', static function (string $uuid) use ($auth, $googleCalendar): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $googleCalendar->synchronize($uuid);
        });
        $router->post('/v1/admin/google-calendar/verify', static function () use ($auth, $googleCalendar): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $googleCalendar->verify();
        });
        $router->delete('/v1/admin/google-calendar', static function () use ($auth, $googleCalendar): void {
            $auth->requireAdmin(); $auth->requireCsrf(); $googleCalendar->disconnect();
        });
    }
}
