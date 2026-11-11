<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\AdminBackupService;

final class AdminBackupController
{
    public function __construct(private AdminBackupService $service) {}

    public function index(): void { Response::success($this->service->overview()); }

    public function create(): void { Response::success($this->service->create(), 201); }

    public function download(string $id): void
    {
        $backup = $this->service->download($id);
        header('Content-Type: application/vnd.sqlite3');
        header('Content-Disposition: attachment; filename="' . $backup['metadata']['id'] . '"');
        header('Content-Length: ' . (string) $backup['metadata']['size']);
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        readfile($backup['path']);
        exit;
    }

    public function restore(string $id): void
    {
        $input = $this->input();
        Response::success($this->service->restore($id, (string) ($input['confirmation'] ?? '')));
    }

    public function restoreUpload(): void
    {
        Response::success($this->service->restoreUpload(
            $_FILES['backup'] ?? [],
            (string) ($_POST['confirmation'] ?? '')
        ));
    }

    /** @return array<string, mixed> */
    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400); }
        if (!is_array($input)) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400); }
        return $input;
    }
}
