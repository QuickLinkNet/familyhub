<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\ShoppingService;

final class ShoppingController
{
    public function __construct(private ShoppingService $service) {}
    public function index(): void { Response::success($this->service->list()); }
    /** @param array{id: string} $actor */
    public function createList(array $actor): void { Response::success($this->service->createList($this->input(), $actor), 201); }
    /** @param array{id: string} $actor */
    public function createItem(string $listUuid, array $actor): void { Response::success($this->service->createItem($listUuid, $this->input(), $actor), 201); }
    public function updateItem(string $uuid): void { Response::success($this->service->updateItem($uuid, $this->input())); }
    /** @param array{id: string} $actor */
    public function toggle(string $uuid, array $actor): void { Response::success($this->service->toggle($uuid, $actor)); }
    public function clearChecked(string $listUuid): void { Response::success($this->service->clearChecked($listUuid)); }
    public function deleteItem(string $uuid): void { $this->service->deleteItem($uuid); Response::noContent(); }
    public function deleteList(string $uuid): void { $this->service->deleteList($uuid); Response::noContent(); }

    /** @return array<string, mixed> */
    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400); }
        if (!is_array($input) || $input === [] || array_is_list($input)) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400); }
        return $input;
    }
}
