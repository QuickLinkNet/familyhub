<?php
declare(strict_types=1);

namespace FamilyHub\Controllers;

use FamilyHub\Core\AppException;
use FamilyHub\Core\ArrayShape;
use FamilyHub\Core\Response;
use FamilyHub\Services\FamilyListService;

final class FamilyListController
{
    public function __construct(private FamilyListService $service) {}
    /** @param array{id: string, role: string} $actor */
    public function index(array $actor): void { Response::success($this->service->all($actor)); }
    /** @param array{id: string, role: string} $actor */
    public function createList(array $actor): void { Response::success($this->service->createList($this->input(), $actor), 201); }
    /** @param array{id: string, role: string} $actor */
    public function updateList(string $uuid, array $actor): void { Response::success($this->service->updateList($uuid, $this->input(), $actor)); }
    /** @param array{id: string, role: string} $actor */
    public function deleteList(string $uuid, array $actor): void { $this->service->deleteList($uuid, $actor); Response::noContent(); }
    /** @param array{id: string, role: string} $actor */
    public function createItem(string $listUuid, array $actor): void { Response::success($this->service->createItem($listUuid, $this->input(), $actor), 201); }
    /** @param array{id: string, role: string} $actor */
    public function updateItem(string $uuid, array $actor): void { Response::success($this->service->updateItem($uuid, $this->input(), $actor)); }
    /** @param array{id: string, role: string} $actor */
    public function toggleItem(string $uuid, array $actor): void { Response::success($this->service->toggleItem($uuid, $actor)); }
    /** @param array{id: string, role: string} $actor */
    public function deleteItem(string $uuid, array $actor): void { $this->service->deleteItem($uuid, $actor); Response::noContent(); }
    /** @param array{id: string, role: string} $actor */
    public function clearCompleted(string $listUuid, array $actor): void { Response::success($this->service->clearCompleted($listUuid, $actor)); }

    /** @return array<string, mixed> */
    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400); }
        if (!is_array($input) || $input === [] || ArrayShape::isList($input)) {
            throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400);
        }
        return $input;
    }
}
