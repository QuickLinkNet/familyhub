<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Config\Config;
use FamilyCompass\Core\Logger;
use FamilyCompass\Core\Response;
use PDO;

final class HealthController
{
    public function __construct(private Config $config, private Logger $logger) {}
    public function show(): void
    {
        try {
            $pdo = new PDO('sqlite:' . $this->config->databasePath(), null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $pdo->query('SELECT 1')->fetchColumn();
        } catch (\Throwable $exception) {
            $this->logger->error('Health database check failed', ['type' => $exception::class]);
            Response::error('DATABASE_UNAVAILABLE', 'Die Datenbank ist derzeit nicht verfÃ¼gbar.', 503);
        }
        Response::success(['status' => 'ok', 'database' => 'ok', 'version' => $this->config->version()]);
    }
}
