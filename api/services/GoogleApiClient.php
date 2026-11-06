<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;

final class GoogleApiClient
{
    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';
    private const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
    private const API_BASE = 'https://www.googleapis.com/calendar/v3';
    private const MAX_BYTES = 10_485_760;

    /** @param array<string, string> $fields @return array<string, mixed> */
    public function token(array $fields): array
    {
        return $this->request('POST', self::TOKEN_URL, ['Content-Type: application/x-www-form-urlencoded'], http_build_query($fields), true);
    }

    public function revoke(string $token): void
    {
        $this->request('POST', self::REVOKE_URL, ['Content-Type: application/x-www-form-urlencoded'], http_build_query(['token' => $token]), false);
    }

    /** @param array<string, scalar> $query @param array<string, mixed>|null $body @return array<string, mixed> */
    public function calendar(string $method, string $path, string $accessToken, array $query = [], ?array $body = null): array
    {
        $url = self::API_BASE . '/' . ltrim($path, '/');
        if ($query !== []) { $url .= '?' . http_build_query($query); }
        $headers = ['Authorization: Bearer ' . $accessToken, 'Accept: application/json'];
        $payload = null;
        if ($body !== null) {
            $headers[] = 'Content-Type: application/json; charset=utf-8';
            $payload = json_encode($body, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        return $this->request($method, $url, $headers, $payload, true);
    }

    /** @param list<string> $headers @return array<string, mixed> */
    private function request(string $method, string $url, array $headers, ?string $body, bool $expectsJson): array
    {
        [$status, $response] = function_exists('curl_init')
            ? $this->curlRequest($method, $url, $headers, $body)
            : $this->streamRequest($method, $url, $headers, $body);
        if ($status === 204 || ($status >= 200 && $status < 300 && !$expectsJson)) { return []; }
        $decoded = null;
        if ($response !== '') {
            try { $decoded = json_decode($response, true, 512, JSON_THROW_ON_ERROR); }
            catch (\JsonException) { $decoded = null; }
        }
        if ($status < 200 || $status >= 300) { throw $this->googleError($status, is_array($decoded) ? $decoded : []); }
        if (!$expectsJson || !is_array($decoded)) {
            throw new AppException('GOOGLE_INVALID_RESPONSE', 'Google hat keine gültige Antwort geliefert.', 502);
        }
        return $decoded;
    }

    /** @param list<string> $headers @return array{int, string} */
    private function curlRequest(string $method, string $url, array $headers, ?string $body): array
    {
        $handle = curl_init($url);
        if ($handle === false) { throw new AppException('GOOGLE_UNAVAILABLE', 'Die Google-Verbindung konnte nicht gestartet werden.', 502); }
        $response = '';
        $options = [
            CURLOPT_CUSTOMREQUEST => $method, CURLOPT_FOLLOWLOCATION => false, CURLOPT_CONNECTTIMEOUT => 7,
            CURLOPT_TIMEOUT => 25, CURLOPT_PROTOCOLS => CURLPROTO_HTTPS, CURLOPT_HTTPHEADER => $headers,
            CURLOPT_USERAGENT => 'FamilyHub/0.8.0',
            CURLOPT_WRITEFUNCTION => static function ($curl, string $chunk) use (&$response): int {
                if (strlen($response) + strlen($chunk) > self::MAX_BYTES) { return 0; }
                $response .= $chunk;
                return strlen($chunk);
            },
        ];
        if ($body !== null) { $options[CURLOPT_POSTFIELDS] = $body; }
        curl_setopt_array($handle, $options);
        $success = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        $error = curl_errno($handle);
        curl_close($handle);
        if ($success === false || $error !== 0) { throw new AppException('GOOGLE_UNAVAILABLE', 'Google ist vorübergehend nicht erreichbar.', 502); }
        return [$status, $response];
    }

    /** @param list<string> $headers @return array{int, string} */
    private function streamRequest(string $method, string $url, array $headers, ?string $body): array
    {
        $context = stream_context_create(['http' => [
            'method' => $method, 'header' => implode("\r\n", array_merge($headers, ['User-Agent: FamilyHub/0.8.0'])),
            'content' => $body ?? '', 'timeout' => 25, 'follow_location' => 0, 'ignore_errors' => true,
        ]]);
        $response = @file_get_contents($url, false, $context, 0, self::MAX_BYTES + 1);
        if ($response === false || strlen($response) > self::MAX_BYTES) { throw new AppException('GOOGLE_UNAVAILABLE', 'Google ist vorübergehend nicht erreichbar.', 502); }
        $statusLine = $http_response_header[0] ?? '';
        preg_match('/\s(\d{3})\s/', $statusLine, $match);
        return [(int) ($match[1] ?? 0), $response];
    }

    /** @param array<string, mixed> $payload */
    private function googleError(int $status, array $payload): AppException
    {
        $error = $payload['error'] ?? '';
        $reason = is_array($error) ? (string) ($error['status'] ?? $error['message'] ?? '') : (string) $error;
        if (in_array($status, [400, 401], true) && in_array($reason, ['invalid_grant', 'invalid_client'], true)) {
            return new AppException('GOOGLE_AUTH_EXPIRED', 'Die Google-Verbindung ist abgelaufen. Bitte im Adminbereich erneut verbinden.', 401);
        }
        if ($status === 401) { return new AppException('GOOGLE_AUTH_EXPIRED', 'Google verlangt eine erneute Anmeldung.', 401); }
        if ($status === 403) { return new AppException('GOOGLE_FORBIDDEN', 'Google hat diese Kalenderaktion nicht erlaubt.', 403); }
        if ($status === 404) { return new AppException('GOOGLE_EVENT_NOT_FOUND', 'Der Google-Termin wurde nicht gefunden.', 404); }
        if ($status === 429) { return new AppException('GOOGLE_RATE_LIMITED', 'Google begrenzt die Kalenderabfrage gerade. Bitte später erneut versuchen.', 503); }
        return new AppException('GOOGLE_REQUEST_FAILED', 'Die Google-Kalenderanfrage ist fehlgeschlagen.', 502);
    }
}
