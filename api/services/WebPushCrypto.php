<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;

final class WebPushCrypto
{
    private const PUBLIC_KEY_PREFIX = '3059301306072a8648ce3d020106082a8648ce3d030107034200';

    /** @return array{privatePem: string, publicKey: string} */
    public function generateKeyPair(): array
    {
        $options = $this->keyOptions();
        $key = openssl_pkey_new($options);
        if ($key === false || !openssl_pkey_export($key, $privatePem, null, $options)) {
            throw new AppException('PUSH_CRYPTO_UNAVAILABLE', 'Der Push-Schlüssel konnte nicht erzeugt werden.', 503);
        }
        $details = openssl_pkey_get_details($key);
        $point = is_array($details) ? $this->ecPoint($details) : null;
        if ($point === null) { throw new AppException('PUSH_CRYPTO_UNAVAILABLE', 'Der Push-Schlüssel ist ungültig.', 503); }
        return ['privatePem' => $privatePem, 'publicKey' => $this->base64Url($point)];
    }

    /** @param array{endpoint: string, p256dh: string, auth: string} $subscription @param array<string, mixed> $payload */
    public function send(array $subscription, string $privatePem, string $publicKey, string $subject, array $payload): int
    {
        if (!function_exists('curl_init') || !function_exists('openssl_pkey_derive')) {
            throw new AppException('PUSH_UNAVAILABLE', 'Web Push benötigt PHP cURL und OpenSSL.', 503);
        }
        $this->assertPublicEndpoint($subscription['endpoint']);
        $json = json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (strlen($json) > 3_000) { throw new AppException('PUSH_PAYLOAD_TOO_LARGE', 'Die Push-Nachricht ist zu groß.', 500); }
        $body = $this->encryptPayload($json, $subscription['p256dh'], $subscription['auth']);
        $jwt = $this->vapidJwt($subscription['endpoint'], $privatePem, $subject);
        $headers = [
            'Authorization: vapid t=' . $jwt . ', k=' . $publicKey,
            'Content-Encoding: aes128gcm',
            'Content-Type: application/octet-stream',
            'TTL: 43200',
            'Urgency: normal',
            'Content-Length: ' . strlen($body),
        ];
        $handle = curl_init($subscription['endpoint']);
        if ($handle === false) { throw new AppException('PUSH_UNAVAILABLE', 'Der Pushdienst konnte nicht gestartet werden.', 502); }
        curl_setopt_array($handle, [
            CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => false, CURLOPT_CONNECTTIMEOUT => 7,
            CURLOPT_TIMEOUT => 20, CURLOPT_PROTOCOLS => CURLPROTO_HTTPS, CURLOPT_USERAGENT => 'FamilyHub/0.26.0',
        ]);
        $response = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        $error = curl_errno($handle);
        curl_close($handle);
        if ($response === false || $error !== 0 || $status === 0) { throw new AppException('PUSH_UNAVAILABLE', 'Der Pushdienst ist vorübergehend nicht erreichbar.', 502); }
        return $status;
    }

    private function encryptPayload(string $payload, string $clientPublicEncoded, string $authEncoded): string
    {
        $clientPublic = $this->base64UrlDecode($clientPublicEncoded);
        $auth = $this->base64UrlDecode($authEncoded);
        if (strlen($clientPublic) !== 65 || $clientPublic[0] !== "\x04" || strlen($auth) !== 16) {
            throw new AppException('PUSH_SUBSCRIPTION_INVALID', 'Die Browser-Pushdaten sind ungültig.', 422);
        }
        $clientKey = openssl_pkey_get_public($this->publicPem($clientPublic));
        $serverKey = openssl_pkey_new($this->keyOptions());
        $details = $serverKey === false ? false : openssl_pkey_get_details($serverKey);
        $serverPublic = is_array($details) ? $this->ecPoint($details) : null;
        if ($clientKey === false || $serverKey === false || $serverPublic === null) {
            throw new AppException('PUSH_CRYPTO_UNAVAILABLE', 'Die Push-Verschlüsselung konnte nicht vorbereitet werden.', 503);
        }
        $sharedSecret = openssl_pkey_derive($clientKey, $serverKey, 32);
        if (!is_string($sharedSecret) || strlen($sharedSecret) !== 32) {
            throw new AppException('PUSH_CRYPTO_UNAVAILABLE', 'Die Push-Verschlüsselung ist fehlgeschlagen.', 503);
        }
        $ikm = hash_hkdf('sha256', $sharedSecret, 32, "WebPush: info\0" . $clientPublic . $serverPublic, $auth);
        $salt = random_bytes(16);
        $contentKey = hash_hkdf('sha256', $ikm, 16, "Content-Encoding: aes128gcm\0", $salt);
        $nonce = hash_hkdf('sha256', $ikm, 12, "Content-Encoding: nonce\0", $salt);
        $tag = '';
        $cipherText = openssl_encrypt($payload . "\x02", 'aes-128-gcm', $contentKey, OPENSSL_RAW_DATA, $nonce, $tag);
        if ($cipherText === false || strlen($tag) !== 16) {
            throw new AppException('PUSH_CRYPTO_UNAVAILABLE', 'Die Push-Nachricht konnte nicht verschlüsselt werden.', 503);
        }
        return $salt . pack('N', 4096) . chr(strlen($serverPublic)) . $serverPublic . $cipherText . $tag;
    }

    private function vapidJwt(string $endpoint, string $privatePem, string $subject): string
    {
        $parts = parse_url($endpoint);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = strtolower((string) ($parts['host'] ?? ''));
        $port = isset($parts['port']) ? ':' . (int) $parts['port'] : '';
        if ($scheme !== 'https' || $host === '') { throw new AppException('PUSH_SUBSCRIPTION_INVALID', 'Der Push-Endpunkt ist ungültig.', 422); }
        $header = $this->base64Url(json_encode(['typ' => 'JWT', 'alg' => 'ES256'], JSON_THROW_ON_ERROR));
        $claims = $this->base64Url(json_encode(['aud' => $scheme . '://' . $host . $port, 'exp' => time() + 43_200, 'sub' => $subject], JSON_THROW_ON_ERROR));
        $input = $header . '.' . $claims;
        $key = openssl_pkey_get_private($privatePem);
        if ($key === false || !openssl_sign($input, $der, $key, OPENSSL_ALGO_SHA256)) {
            throw new AppException('PUSH_CRYPTO_UNAVAILABLE', 'Die Push-Anfrage konnte nicht signiert werden.', 503);
        }
        return $input . '.' . $this->base64Url($this->derSignatureToJose($der));
    }

    private function assertPublicEndpoint(string $endpoint): void
    {
        $parts = parse_url($endpoint);
        $host = strtolower((string) ($parts['host'] ?? ''));
        $port = (int) ($parts['port'] ?? 443);
        if (($parts['scheme'] ?? '') !== 'https' || $host === '' || $port !== 443 || in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
            throw new AppException('PUSH_SUBSCRIPTION_INVALID', 'Der Push-Endpunkt ist nicht erlaubt.', 422);
        }
        $records = dns_get_record($host, DNS_A | DNS_AAAA);
        if ($records === false || $records === []) { throw new AppException('PUSH_UNAVAILABLE', 'Der Push-Endpunkt ist nicht erreichbar.', 502); }
        foreach ($records as $record) {
            $ip = (string) ($record['ip'] ?? $record['ipv6'] ?? '');
            if ($ip === '' || filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                throw new AppException('PUSH_SUBSCRIPTION_INVALID', 'Der Push-Endpunkt ist nicht öffentlich erreichbar.', 422);
            }
        }
    }

    /** @param array<string, mixed> $details */
    private function ecPoint(array $details): ?string
    {
        $x = $details['ec']['x'] ?? null; $y = $details['ec']['y'] ?? null;
        return is_string($x) && strlen($x) === 32 && is_string($y) && strlen($y) === 32 ? "\x04" . $x . $y : null;
    }

    private function publicPem(string $point): string
    {
        $der = hex2bin(self::PUBLIC_KEY_PREFIX) . $point;
        return "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END PUBLIC KEY-----\n";
    }

    private function derSignatureToJose(string $der): string
    {
        $offset = 0;
        if (ord($der[$offset++]) !== 0x30) { throw new AppException('PUSH_CRYPTO_UNAVAILABLE', 'Die Push-Signatur ist ungültig.', 503); }
        $this->asnLength($der, $offset);
        $r = $this->asnInteger($der, $offset);
        $s = $this->asnInteger($der, $offset);
        return str_pad(ltrim($r, "\0"), 32, "\0", STR_PAD_LEFT) . str_pad(ltrim($s, "\0"), 32, "\0", STR_PAD_LEFT);
    }

    private function asnInteger(string $der, int &$offset): string
    {
        if (ord($der[$offset++]) !== 0x02) { throw new AppException('PUSH_CRYPTO_UNAVAILABLE', 'Die Push-Signatur ist ungültig.', 503); }
        $length = $this->asnLength($der, $offset);
        $value = substr($der, $offset, $length); $offset += $length;
        if ($length < 1 || $length > 33) { throw new AppException('PUSH_CRYPTO_UNAVAILABLE', 'Die Push-Signatur ist ungültig.', 503); }
        return $value;
    }

    private function asnLength(string $der, int &$offset): int
    {
        $length = ord($der[$offset++]);
        if (($length & 0x80) === 0) { return $length; }
        $bytes = $length & 0x7f; $length = 0;
        for ($index = 0; $index < $bytes; $index++) { $length = ($length << 8) | ord($der[$offset++]); }
        return $length;
    }

    private function base64Url(string $value): string { return rtrim(strtr(base64_encode($value), '+/', '-_'), '='); }

    private function base64UrlDecode(string $value): string
    {
        $decoded = base64_decode(strtr($value, '-_', '+/') . str_repeat('=', (4 - strlen($value) % 4) % 4), true);
        return $decoded === false ? '' : $decoded;
    }

    /** @return array<string, int|string> */
    private function keyOptions(): array
    {
        $options = ['private_key_type' => OPENSSL_KEYTYPE_EC, 'curve_name' => 'prime256v1'];
        if (PHP_OS_FAMILY !== 'Windows') { return $options; }
        $configured = getenv('OPENSSL_CONF');
        $candidates = is_string($configured) && $configured !== '' ? [$configured] : [
            dirname(PHP_BINARY) . DIRECTORY_SEPARATOR . 'extras' . DIRECTORY_SEPARATOR . 'ssl' . DIRECTORY_SEPARATOR . 'openssl.cnf',
            dirname(PHP_BINARY) . DIRECTORY_SEPARATOR . 'extras' . DIRECTORY_SEPARATOR . 'openssl' . DIRECTORY_SEPARATOR . 'openssl.cnf',
        ];
        foreach ($candidates as $candidate) {
            if (@is_file($candidate)) { $options['config'] = $candidate; break; }
        }
        return $options;
    }
}
