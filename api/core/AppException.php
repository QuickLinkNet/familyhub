<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

use RuntimeException;

final class AppException extends RuntimeException
{
    public function __construct(private string $codeValue, string $message, private int $status = 500)
    {
        parent::__construct($message);
    }
    public function errorCode(): string { return $this->codeValue; }
    public function statusCode(): int { return $this->status; }
}
