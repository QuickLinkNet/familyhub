<?php
declare(strict_types=1);

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$projectRoot = dirname(__DIR__);
$candidate = realpath($projectRoot . $requestPath);

if ($candidate !== false && str_starts_with($candidate, $projectRoot) && is_file($candidate)) {
    return false;
}

if (str_starts_with($requestPath, '/api/')) {
    require __DIR__ . '/index.php';
    return true;
}

return false;
