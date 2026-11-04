<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\FamilyMemberService;

final class FamilyMemberController
{
    public function __construct(private FamilyMemberService $service) {}
    public function index(): void { Response::success($this->service->list()); }
    public function create(): void { Response::success($this->service->create($this->input()), 201); }
    public function update(string $uuid): void { Response::success($this->service->update($uuid, $this->input())); }
    public function delete(string $uuid): void { $this->service->delete($uuid); Response::noContent(); }

    /** @return array<string, mixed> */
    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try {
            $input = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400);
        }
        if (!is_array($input) || $input === [] || array_keys($input) === range(0, count($input) - 1)) {
            throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400);
        }
        return $input;
    }
}
