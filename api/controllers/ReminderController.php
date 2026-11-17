<?php
declare(strict_types=1);

namespace FamilyHub\Controllers;

use FamilyHub\Core\Response;
use FamilyHub\Services\ReminderService;

final class ReminderController
{
    public function __construct(private ReminderService $service) {}

    /** @param array{id: string, name: string, color: string, role: string} $actor */
    public function index(array $actor): void
    {
        Response::success($this->service->overview($actor));
    }
}
