<?php
declare(strict_types=1);

namespace FamilyHub\Controllers;

use FamilyHub\Core\AppException;
use FamilyHub\Core\ArrayShape;
use FamilyHub\Core\Response;
use FamilyHub\Services\ProfilePreferenceService;

final class ProfilePreferenceController
{
    public function __construct(private ProfilePreferenceService $service) {}

    /** @param array{id: string} $actor */
    public function show(array $actor): void { Response::success($this->service->show($actor)); }

    /** @param array{id: string} $actor */
    public function update(array $actor): void { Response::success($this->service->update($actor, $this->input())); }

    /** @return array<string, mixed> */
    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false ? '' : $raw, true, 32, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiges JSON-Objekt erwartet.', 400); }
        if (!is_array($input) || ArrayShape::isList($input)) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400); }
        return $input;
    }
}
