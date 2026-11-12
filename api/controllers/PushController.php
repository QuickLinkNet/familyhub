<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\PushService;

final class PushController
{
    public function __construct(private PushService $service) {}

    public function status(array $actor): void { Response::success($this->service->status($actor)); }

    public function subscribe(array $actor): void
    {
        Response::success($this->service->subscribe($actor, $this->input(), (string) ($_SERVER['HTTP_USER_AGENT'] ?? '')), 201);
    }

    public function unsubscribe(array $actor): void
    {
        $this->service->unsubscribe($actor, $this->input());
        Response::noContent();
    }

    public function test(array $actor): void { Response::success($this->service->test($actor)); }
    public function administration(): void { Response::success($this->service->administration()); }
    public function dispatch(): void { Response::success($this->service->dispatchAll()); }
    public function scheduledDispatch(): void { Response::success($this->service->dispatchWithToken((string) ($_GET['token'] ?? ''))); }

    /** @return array<string, mixed> */
    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false ? '' : $raw, true, 32, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiges JSON-Objekt erwartet.', 400); }
        if (!is_array($input) || \FamilyCompass\Core\ArrayShape::isList($input)) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400); }
        return $input;
    }
}
