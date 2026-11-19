<?php
declare(strict_types=1);

namespace FamilyHub\Controllers;

use FamilyHub\Core\AppException;
use FamilyHub\Core\Response;
use FamilyHub\Services\AuthService;

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

    /** @param array{id: string, name: string, color: string, role: string} $actor */
    public function createInvitation(array $actor): void
    {
        Response::success($this->service->createInvitation($actor, $this->input()), 201);
    }

    public function invitation(string $token): void
    {
        Response::success($this->service->invitation($token));
    }

    public function redeemInvitation(string $token): void
    {
        Response::success($this->service->redeemInvitation($token, $this->input()));
    }

    public function devices(): void
    {
        Response::success($this->service->devices());
    }

    public function revokeDevice(string $uuid): void
    {
        $this->service->revokeDevice($uuid);
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
        if (!is_array($input) || \FamilyHub\Core\ArrayShape::isList($input)) {
            throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400);
        }
        return $input;
    }
}
