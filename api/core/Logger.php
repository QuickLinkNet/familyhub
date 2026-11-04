<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

use FamilyCompass\Config\Config;

final class Logger
{
    public function __construct(private Config $config) {}

    public function info(string $message, array $context = []): void { $this->write('INFO', $message, $context); }
    public function warning(string $message, array $context = []): void { $this->write('WARNING', $message, $context); }
    public function error(string $message, array $context = []): void { $this->write('ERROR', $message, $context); }

    private function write(string $level, string $message, array $context): void
    {
        $directory = $this->config->logsPath();
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            error_log("[$level] $message");
            return;
        }
        $safeContext = array_diff_key($context, array_flip(['password', 'pin', 'session_id', 'token', 'authorization']));
        $line = sprintf("%s [%s] %s %s\n", gmdate('c'), $level, $message, json_encode($safeContext, JSON_UNESCAPED_UNICODE));
        file_put_contents($directory . DIRECTORY_SEPARATOR . 'app.log', $line, FILE_APPEND | LOCK_EX);
    }
}
