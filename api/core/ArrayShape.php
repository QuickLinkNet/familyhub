<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

final class ArrayShape
{
    /** @param array<mixed> $value */
    public static function isList(array $value): bool
    {
        $expectedKey = 0;
        foreach ($value as $key => $_item) {
            if ($key !== $expectedKey) {
                return false;
            }
            $expectedKey++;
        }
        return true;
    }
}
