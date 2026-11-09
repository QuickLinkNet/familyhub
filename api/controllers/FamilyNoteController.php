<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\FamilyNoteService;

final class FamilyNoteController
{
    public function __construct(private FamilyNoteService $service) {}
    public function index(): void { Response::success($this->service->board()); }
    /** @param array{id: string, role: string} $actor */
    public function create(array $actor): void { Response::success($this->service->create($this->input(), $actor), 201); }
    /** @param array{id: string, role: string} $actor */
    public function update(string $uuid, array $actor): void { Response::success($this->service->update($uuid, $this->input(), $actor)); }
    /** @param array{id: string, role: string} $actor */
    public function delete(string $uuid, array $actor): void { $this->service->delete($uuid, $actor); Response::noContent(); }

    /** @return array<string, mixed> */
    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400); }
        if (!is_array($input) || $input === [] || \FamilyCompass\Core\ArrayShape::isList($input)) {
            throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400);
        }
        return $input;
    }
}
