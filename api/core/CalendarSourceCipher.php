<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

use FamilyCompass\Config\Config;

final class CalendarSourceCipher
{
    private const CIPHER = 'aes-256-gcm';
    private const NONCE_BYTES = 12;
    private const TAG_BYTES = 16;

    public function __construct(private Config $config) {}

    public function encrypt(string $plainText): string
    {
        $nonce = random_bytes(self::NONCE_BYTES);
        $tag = '';
        $cipherText = openssl_encrypt($plainText, self::CIPHER, $this->key(), OPENSSL_RAW_DATA, $nonce, $tag);
        if ($cipherText === false || strlen($tag) !== self::TAG_BYTES) {
            throw new AppException('ENCRYPTION_UNAVAILABLE', 'Die Kalenderadresse konnte nicht sicher gespeichert werden.', 500);
        }
        return base64_encode($nonce . $tag . $cipherText);
    }

    public function decrypt(string $payload): string
    {
        $decoded = base64_decode($payload, true);
        if ($decoded === false || strlen($decoded) <= self::NONCE_BYTES + self::TAG_BYTES) {
            throw new AppException('CALENDAR_SOURCE_INVALID', 'Die gespeicherte Kalenderadresse ist beschädigt.', 500);
        }
        $nonce = substr($decoded, 0, self::NONCE_BYTES);
        $tag = substr($decoded, self::NONCE_BYTES, self::TAG_BYTES);
        $cipherText = substr($decoded, self::NONCE_BYTES + self::TAG_BYTES);
        $plainText = openssl_decrypt($cipherText, self::CIPHER, $this->key(), OPENSSL_RAW_DATA, $nonce, $tag);
        if ($plainText === false) {
            throw new AppException('CALENDAR_SOURCE_INVALID', 'Die gespeicherte Kalenderadresse konnte nicht gelesen werden.', 500);
        }
        return $plainText;
    }

    private function key(): string
    {
        if (!extension_loaded('openssl')) {
            throw new AppException('OPENSSL_UNAVAILABLE', 'Die PHP-Erweiterung OpenSSL ist nicht aktiviert.', 500);
        }
        $path = $this->config->calendarSourceKeyPath();
        if (!is_file($path)) {
            $key = random_bytes(32);
            if (file_put_contents($path, $key, LOCK_EX) !== 32) {
                throw new AppException('STORAGE_UNAVAILABLE', 'Der Schlüssel für Kalenderquellen konnte nicht gespeichert werden.', 500);
            }
            @chmod($path, 0600);
            return $key;
        }
        $key = file_get_contents($path);
        if ($key === false || strlen($key) !== 32) {
            throw new AppException('CALENDAR_SOURCE_INVALID', 'Der Schlüssel für Kalenderquellen ist ungültig.', 500);
        }
        return $key;
    }
}
