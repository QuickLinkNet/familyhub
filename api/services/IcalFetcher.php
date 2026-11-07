<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;

final class IcalFetcher
{
    private const MAX_BYTES = 5_242_880;

    public function normaliseGoogleUrl(string $url): string
    {
        $url = trim($url);
        if (str_starts_with($url, 'webcal://')) {
            $url = 'https://' . substr($url, 9);
        }
        if (strlen($url) > 2_048 || filter_var($url, FILTER_VALIDATE_URL) === false) {
            throw new AppException('VALIDATION_ERROR', 'Bitte eine gültige Google-iCal-Adresse eingeben.', 422);
        }
        $parts = parse_url($url);
        $host = strtolower((string) ($parts['host'] ?? ''));
        $path = (string) ($parts['path'] ?? '');
        if (($parts['scheme'] ?? '') !== 'https' || $host !== 'calendar.google.com' || !str_starts_with($path, '/calendar/ical/') || !str_ends_with($path, '/basic.ics')) {
            throw new AppException('VALIDATION_ERROR', 'Bitte die „Geheime Adresse im iCal-Format“ aus Google Kalender → Einstellungen → Kalender integrieren verwenden.', 422);
        }
        if (isset($parts['user']) || isset($parts['pass']) || isset($parts['port'])) {
            throw new AppException('VALIDATION_ERROR', 'Die Kalenderadresse enthält nicht erlaubte Zugangsdaten oder Ports.', 422);
        }
        $this->assertPublicHost($host);
        return $url;
    }

    public function fetch(string $url): string
    {
        $url = $this->normaliseGoogleUrl($url);
        if (function_exists('curl_init')) {
            return $this->fetchWithCurl($url);
        }
        $context = stream_context_create(['http' => [
            'method' => 'GET',
            'header' => "Accept: text/calendar\r\nUser-Agent: FamilyHub/0.12.0\r\n",
            'timeout' => 15,
            'follow_location' => 0,
            'ignore_errors' => true,
        ]]);
        $content = @file_get_contents($url, false, $context, 0, self::MAX_BYTES + 1);
        $statusLine = $http_response_header[0] ?? '';
        preg_match('/\s(\d{3})\s/', $statusLine, $statusMatch);
        $status = isset($statusMatch[1]) ? (int) $statusMatch[1] : 0;
        if ($status !== 200) {
            throw $this->fetchException($url, $status, $content === false);
        }
        if ($content === false || strlen($content) > self::MAX_BYTES) {
            throw new AppException('CALENDAR_SYNC_FAILED', 'Der Google-Kalender konnte nicht sicher geladen werden.', 502);
        }
        return $this->validateCalendar($content);
    }

    private function fetchWithCurl(string $url): string
    {
        $handle = curl_init($url);
        if ($handle === false) {
            throw new AppException('CALENDAR_SYNC_FAILED', 'Die Kalenderverbindung konnte nicht gestartet werden.', 502);
        }
        $content = '';
        curl_setopt_array($handle, [
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_HTTPHEADER => ['Accept: text/calendar'],
            CURLOPT_USERAGENT => 'FamilyHub/0.12.0',
            CURLOPT_WRITEFUNCTION => static function ($curl, string $chunk) use (&$content): int {
                if (strlen($content) + strlen($chunk) > self::MAX_BYTES) { return 0; }
                $content .= $chunk;
                return strlen($chunk);
            },
        ]);
        $success = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        $curlError = curl_errno($handle);
        curl_close($handle);
        if ($success === false || $status !== 200) {
            throw $this->fetchException($url, $status, $curlError !== 0);
        }
        return $this->validateCalendar($content);
    }

    private function fetchException(string $url, int $status, bool $connectionFailed): AppException
    {
        if (str_contains((string) parse_url($url, PHP_URL_PATH), '/public/basic.ics')) {
            return new AppException(
                'PUBLIC_CALENDAR_NOT_ACCESSIBLE',
                'Diese öffentliche iCal-Adresse funktioniert nur bei einem öffentlich freigegebenen Kalender. Nutze stattdessen die private beziehungsweise geheime iCal-Adresse direkt darunter.',
                422
            );
        }
        if (in_array($status, [401, 403, 404, 410], true)) {
            return new AppException('CALENDAR_LINK_REJECTED', 'Google hat die geheime iCal-Adresse abgelehnt. Bitte kopiere sie in Google Kalender unter „Kalender integrieren“ erneut.', 422);
        }
        if ($status === 429) {
            return new AppException('CALENDAR_RATE_LIMITED', 'Google begrenzt die Kalenderabfrage gerade. Bitte versuche es in einigen Minuten erneut.', 503);
        }
        if ($connectionFailed) {
            return new AppException('CALENDAR_SYNC_FAILED', 'Google hat nicht rechtzeitig geantwortet. Die bestehende Kalenderverbindung bleibt unverändert.', 502);
        }
        return new AppException('CALENDAR_SYNC_FAILED', 'Google konnte den Kalender gerade nicht bereitstellen. Bitte versuche es später erneut.', 502);
    }

    private function validateCalendar(string $content): string
    {
        if (!str_contains($content, 'BEGIN:VCALENDAR') || !str_contains($content, 'END:VCALENDAR')) {
            throw new AppException('CALENDAR_SYNC_FAILED', 'Die Adresse liefert keinen gültigen iCal-Kalender.', 422);
        }
        return $content;
    }

    private function assertPublicHost(string $host): void
    {
        $addresses = gethostbynamel($host);
        if ($addresses === false || $addresses === []) {
            throw new AppException('CALENDAR_SYNC_FAILED', 'Der Google-Kalenderdienst ist derzeit nicht erreichbar.', 502);
        }
        foreach ($addresses as $address) {
            if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                throw new AppException('CALENDAR_SYNC_FAILED', 'Die Kalenderadresse verweist auf ein nicht erlaubtes Netzwerkziel.', 422);
            }
        }
    }
}
