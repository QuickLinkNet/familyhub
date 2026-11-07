<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\MealService;

final class MealController
{
    public function __construct(private MealService $service) {}
    public function index(): void { Response::success($this->service->planner((string) ($_GET['from'] ?? ''), (string) ($_GET['to'] ?? ''))); }
    /** @param array{id: string} $actor */
    public function createRecipe(array $actor): void { Response::success($this->service->createRecipe($this->input(), $actor), 201); }
    public function deleteRecipe(string $uuid): void { $this->service->deleteRecipe($uuid); Response::noContent(); }
    /** @param array{id: string} $actor */
    public function plan(array $actor): void { Response::success($this->service->plan($this->input(), $actor), 201); }
    public function deleteEntry(string $uuid): void { $this->service->deleteEntry($uuid); Response::noContent(); }
    /** @param array{id: string} $actor */
    public function addToShopping(string $uuid, array $actor): void { Response::success($this->service->addToShopping($uuid, $this->input(), $actor), 201); }

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
