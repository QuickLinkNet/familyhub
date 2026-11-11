<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\ArrayShape;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\WallPresentationService;

final class WallPresentationController
{
    public function __construct(private WallPresentationService $service) {}
    public function show(): void { Response::success($this->service->presentation()); }
    public function administration(): void { Response::success($this->service->administration()); }
    public function update(): void { Response::success($this->service->update($this->input())); }
    /** @param array{id: string} $actor */
    public function upload(array $actor): void { Response::success($this->service->upload($_FILES['photo'] ?? [], $actor), 201); }
    public function delete(string $uuid): void { $this->service->delete($uuid); Response::noContent(); }
    public function photo(string $uuid): void
    {
        $photo = $this->service->photo($uuid);
        header('Content-Type: ' . $photo['mimeType']);
        header('Cache-Control: private, max-age=86400');
        header('X-Content-Type-Options: nosniff');
        readfile($photo['path']);
        exit;
    }

    /** @return array<string, mixed> */
    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400); }
        if (!is_array($input) || $input === [] || ArrayShape::isList($input)) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400); }
        return $input;
    }
}
