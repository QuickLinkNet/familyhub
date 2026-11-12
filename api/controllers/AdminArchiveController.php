<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\Response;
use FamilyCompass\Services\AdminArchiveService;

final class AdminArchiveController
{
    public function __construct(private AdminArchiveService $service) {}

    public function download(): void
    {
        $archive = $this->service->create();
        try {
            header('Content-Type: application/zip');
            header('Content-Disposition: attachment; filename="' . $archive['name'] . '"');
            header('Content-Length: ' . (string) $archive['size']);
            header('Cache-Control: no-store');
            header('X-Content-Type-Options: nosniff');
            readfile($archive['path']);
        } finally {
            @unlink($archive['path']);
        }
        exit;
    }

    public function restoreUpload(): void
    {
        Response::success($this->service->restoreUpload(
            $_FILES['archive'] ?? [],
            (string) ($_POST['confirmation'] ?? '')
        ));
    }
}
