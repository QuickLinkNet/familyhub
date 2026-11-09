<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\CalendarService;

final class CalendarController
{
    public function __construct(private CalendarService $service) {}

    public function calendars(): void { Response::success($this->service->calendars()); }

    public function events(): void
    {
        Response::success($this->service->events((string) ($_GET['from'] ?? ''), (string) ($_GET['to'] ?? '')));
    }

    /** @param array{id: string, name: string, color: string, role: string} $actor */
    public function create(array $actor): void { Response::success($this->service->create($this->input(), $actor), 201); }

    public function update(string $uuid): void { Response::success($this->service->update($uuid, $this->input())); }

    public function delete(string $uuid): void
    {
        $this->service->delete($uuid);
        Response::noContent();
    }

    /** @return array<string, mixed> */
    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try {
            $input = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400);
        }
        if (!is_array($input) || $input === [] || \FamilyCompass\Core\ArrayShape::isList($input)) {
            throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400);
        }
        return $input;
    }
}
