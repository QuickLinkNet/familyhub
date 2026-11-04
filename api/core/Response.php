<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

final class Response
{
    public static function success(mixed $data, int $status = 200): void
    {
        self::send(['success' => true, 'data' => $data], $status);
    }
    public static function error(string $code, string $message, int $status): void
    {
        self::send(['success' => false, 'error' => ['code' => $code, 'message' => $message]], $status);
    }
    public static function noContent(): void
    {
        http_response_code(204);
        header('Cache-Control: no-store');
        exit;
    }
    private static function send(array $payload, int $status): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        exit;
    }
}