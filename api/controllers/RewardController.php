<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\RewardService;

final class RewardController
{
    public function __construct(private RewardService $service) {}

    public function index(): void { Response::success($this->service->dashboard()); }

    /** @param array{id: string, name: string, color: string, role: string} $actor */
    public function create(array $actor): void { Response::success($this->service->create($this->input(), $actor), 201); }

    /** @param array{id: string, name: string, color: string, role: string} $actor */
    public function redeem(string $uuid, array $actor): void { Response::success($this->service->redeem($uuid, $this->input(true), $actor)); }

    /** @param array{id: string, name: string, color: string, role: string} $actor */
    public function bonus(array $actor): void { Response::success($this->service->bonus($this->input(), $actor), 201); }

    public function delete(string $uuid): void { $this->service->delete($uuid); Response::noContent(); }

    /** @return array<string, mixed> */
    private function input(bool $allowEmpty = false): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false || $raw === '' ? '{}' : $raw, true, 512, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400); }
        if (!is_array($input) || \FamilyCompass\Core\ArrayShape::isList($input) || (!$allowEmpty && $input === [])) {
            throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400);
        }
        return $input;
    }
}
