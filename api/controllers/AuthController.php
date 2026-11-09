<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\AuthService;

final class AuthController
{
    public function __construct(private AuthService $service) {}

    public function profiles(): void
    {
        Response::success($this->service->profiles());
    }

    public function session(): void
    {
        Response::success($this->service->session());
    }

    public function login(): void
    {
        Response::success($this->service->login($this->input()));
    }

    public function logout(): void
    {
        $this->service->logout();
        Response::noContent();
    }

    /** @return array<string, mixed> */
    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try {
            $input = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400);
        }
        if (!is_array($input) || \FamilyCompass\Core\ArrayShape::isList($input)) {
            throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400);
        }
        return $input;
    }
}
