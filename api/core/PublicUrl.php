<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

final class PublicUrl
{
    public function appBase(): string
    {
        $configured = trim((string) getenv('FAMILYHUB_PUBLIC_URL'));
        if ($configured !== '' && filter_var($configured, FILTER_VALIDATE_URL) !== false) {
            return rtrim($configured, '/');
        }
        $forwardedProto = strtolower(trim(explode(',', (string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''))[0]));
        $scheme = $forwardedProto === 'https' || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
        if (preg_match('/^[a-zA-Z0-9.-]+(?::\d{1,5})?$/', $host) !== 1) { $host = 'localhost'; }
        $script = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '/api/index.php'));
        $apiPosition = strpos($script, '/api/');
        $basePath = $apiPosition === false ? '' : substr($script, 0, $apiPosition);
        return $scheme . '://' . $host . rtrim($basePath, '/');
    }

    public function api(string $path): string { return $this->appBase() . '/api/v1/' . ltrim($path, '/'); }
    public function app(string $path): string { return $this->appBase() . '/' . ltrim($path, '/'); }
}
