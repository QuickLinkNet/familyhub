<?php
declare(strict_types=1);

use FamilyCompass\Services\WebPushCrypto;

$apiPath = dirname(__DIR__);
spl_autoload_register(static function (string $class) use ($apiPath): void {
    $prefix = 'FamilyCompass\\'; if (!str_starts_with($class, $prefix)) { return; }
    $segments = explode('\\', substr($class, strlen($prefix))); $segments[0] = strtolower($segments[0]);
    $path = $apiPath . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments) . '.php'; if (is_file($path)) { require $path; }
});

$base64Url = static fn (string $value): string => rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
$decode = static fn (string $value): string => (string) base64_decode(strtr($value, '-_', '+/') . str_repeat('=', (4 - strlen($value) % 4) % 4), true);

if (PHP_OS_FAMILY === 'Windows' && getenv('OPENSSL_CONF') === false) {
    $localConfig = 'C:\\xampp\\php\\extras\\ssl\\openssl.cnf';
    if (is_file($localConfig)) { putenv('OPENSSL_CONF=' . $localConfig); }
}

$crypto = new WebPushCrypto();
$vapid = $crypto->generateKeyPair();
if (strlen($decode($vapid['publicKey'])) !== 65 || !str_contains($vapid['privatePem'], 'PRIVATE KEY')) {
    fwrite(STDERR, "VAPID key generation failed.\n"); exit(1);
}

$clientOptions = ['private_key_type' => OPENSSL_KEYTYPE_EC, 'curve_name' => 'prime256v1'];
if (isset($localConfig) && is_file($localConfig)) { $clientOptions['config'] = $localConfig; }
$client = openssl_pkey_new($clientOptions);
$details = $client === false ? false : openssl_pkey_get_details($client);
$clientPublic = is_array($details) ? "\x04" . $details['ec']['x'] . $details['ec']['y'] : '';
$encrypt = new ReflectionMethod(WebPushCrypto::class, 'encryptPayload');
$encrypt->setAccessible(true);
$body = $encrypt->invoke($crypto, '{"title":"FamilyHub"}', $base64Url($clientPublic), $base64Url(random_bytes(16)));
if (!is_string($body) || strlen($body) < 120 || ord($body[20]) !== 65) {
    fwrite(STDERR, "Web Push payload encryption failed.\n"); exit(1);
}

$jwtMethod = new ReflectionMethod(WebPushCrypto::class, 'vapidJwt');
$jwtMethod->setAccessible(true);
$jwt = $jwtMethod->invoke($crypto, 'https://push.example.test/subscription/123', $vapid['privatePem'], 'https://familyhub.example.test');
$parts = explode('.', (string) $jwt);
if (count($parts) !== 3 || strlen($decode($parts[2])) !== 64) {
    fwrite(STDERR, "VAPID JWT signing failed.\n"); exit(1);
}

echo "Web Push crypto smoke test passed.\n";
