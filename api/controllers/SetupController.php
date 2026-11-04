<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\SetupService;

final class SetupController
{
    public function __construct(private SetupService $service, private string $version) {}
    public function status(): void { Response::success($this->service->status($this->version)); }
    public function install(): void { Response::success($this->service->install($this->input()), 201); }

    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR); }
        catch (\JsonException $error) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400); }
        if (!is_array($input) || $input === [] || array_keys($input) === range(0, count($input) - 1)) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400); }
        return $input;
    }
}
