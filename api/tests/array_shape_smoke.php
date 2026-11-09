<?php
declare(strict_types=1);

use FamilyCompass\Core\ArrayShape;

require dirname(__DIR__) . '/core/ArrayShape.php';

function expectArrayShape(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

expectArrayShape(ArrayShape::isList([]), 'Eine leere Liste muss als Liste erkannt werden.');
expectArrayShape(ArrayShape::isList(['eins', 'zwei']), 'Fortlaufende numerische Schlüssel müssen als Liste erkannt werden.');
expectArrayShape(!ArrayShape::isList(['name' => 'FamilyHub']), 'Ein JSON-Objekt darf nicht als Liste erkannt werden.');
expectArrayShape(!ArrayShape::isList([1 => 'eins', 2 => 'zwei']), 'Eine nicht bei null beginnende Folge darf nicht als Liste erkannt werden.');

echo "Array shape smoke test passed.\n";
