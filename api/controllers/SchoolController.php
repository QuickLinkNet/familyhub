<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use DateTimeImmutable;
use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\SchoolService;

final class SchoolController
{
    public function __construct(private SchoolService $service) {}
    public function index(): void { $today = new DateTimeImmutable('today'); Response::success($this->service->board((string) ($_GET['from'] ?? $today->modify('-14 days')->format('Y-m-d')), (string) ($_GET['to'] ?? $today->modify('+62 days')->format('Y-m-d')))); }
    /** @param array{id: string, role: string} $actor */
    public function createLesson(array $actor): void { Response::success($this->service->createLesson($this->input(), $actor), 201); }
    /** @param array{id: string, role: string} $actor */
    public function updateLesson(string $uuid, array $actor): void { Response::success($this->service->updateLesson($uuid, $this->input(), $actor)); }
    /** @param array{id: string, role: string} $actor */
    public function deleteLesson(string $uuid, array $actor): void { $this->service->deleteLesson($uuid, $actor); Response::noContent(); }
    /** @param array{id: string, role: string} $actor */
    public function createItem(array $actor): void { Response::success($this->service->createItem($this->input(), $actor), 201); }
    /** @param array{id: string, role: string} $actor */
    public function updateItem(string $uuid, array $actor): void { Response::success($this->service->updateItem($uuid, $this->input(), $actor)); }
    /** @param array{id: string, role: string} $actor */
    public function toggleItem(string $uuid, array $actor): void { Response::success($this->service->toggleItem($uuid, $actor)); }
    /** @param array{id: string, role: string} $actor */
    public function deleteItem(string $uuid, array $actor): void { $this->service->deleteItem($uuid, $actor); Response::noContent(); }

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
