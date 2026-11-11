<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\ArrayShape;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\FamilyGoalService;

final class FamilyGoalController
{
    public function __construct(private FamilyGoalService $service) {}
    public function index(): void { Response::success($this->service->board()); }
    /** @param array{id: string} $actor */
    public function create(array $actor): void { Response::success($this->service->create($this->input(), $actor), 201); }
    public function update(string $uuid): void { Response::success($this->service->update($uuid, $this->input())); }
    /** @param array{id: string} $actor */
    public function contribute(string $uuid, array $actor): void { Response::success($this->service->contribute($uuid, $this->input(true), $actor)); }
    public function delete(string $uuid): void { $this->service->delete($uuid); Response::noContent(); }

    /** @return array<string, mixed> */
    private function input(bool $allowEmpty = false): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false || $raw === '' ? '{}' : $raw, true, 512, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400); }
        if (!is_array($input) || ArrayShape::isList($input) || (!$allowEmpty && $input === [])) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400); }
        return $input;
    }
}
