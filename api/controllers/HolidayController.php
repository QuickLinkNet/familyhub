<?php
declare(strict_types=1);

namespace FamilyHub\Controllers;

use FamilyHub\Core\AppException;
use FamilyHub\Core\Response;
use FamilyHub\Services\HolidayService;

final class HolidayController
{
    public function __construct(private HolidayService $service) {}
    public function status(): void { Response::success($this->service->status()); }
    public function preview(): void { Response::success($this->service->preview($this->input())); }
    /** @param array{id: string} $actor */
    public function configure(array $actor): void { Response::success($this->service->configure($this->input(), $actor)); }
    public function synchronize(): void { Response::success($this->service->synchronize()); }
    public function delete(): void { $this->service->remove(); Response::noContent(); }

    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false ? '' : $raw, true, 64, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400); }
        if (!is_array($input) || \FamilyHub\Core\ArrayShape::isList($input)) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400); }
        return $input;
    }
}

