<?php
declare(strict_types=1);

namespace FamilyHub\Services;

use FamilyHub\Config\Config;
use FamilyHub\Core\AppException;

final class OpenHolidaysClient
{
    private const BASE_URL = 'https://openholidaysapi.org';
    private const MAX_BYTES = 1_048_576;

    /** @return list<array<string, mixed>> */
    public function fetch(string $type, string $subdivision, string $from, string $to): array
    {
        $endpoint = $type === 'PUBLIC' ? '/PublicHolidays' : '/SchoolHolidays';
        $query = http_build_query([
            'countryIsoCode' => 'DE',
            'languageIsoCode' => 'DE',
            'validFrom' => $from,
            'validTo' => $to,
            'subdivisionCode' => $subdivision,
        ]);
        $payload = $this->request(self::BASE_URL . $endpoint . '?' . $query);
        try { $rows = json_decode($payload, true, 128, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('HOLIDAY_PROVIDER_INVALID', 'Der Ferien-Dienst hat ungültige Daten geliefert.', 502); }
        if (!is_array($rows) || !\FamilyHub\Core\ArrayShape::isList($rows)) {
            throw new AppException('HOLIDAY_PROVIDER_INVALID', 'Der Ferien-Dienst hat ein unbekanntes Datenformat geliefert.', 502);
        }
        return array_values(array_filter(array_map(fn (mixed $row): ?array => $this->mapRow($row, $type), $rows)));
    }

    private function request(string $url): string
    {
        if (function_exists('curl_init')) {
            $handle = curl_init($url);
            if ($handle === false) { throw $this->unavailable(); }
            $content = '';
            curl_setopt_array($handle, [
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_TIMEOUT => 15,
                CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
                CURLOPT_HTTPHEADER => ['Accept: application/json'],
                CURLOPT_USERAGENT => Config::userAgent(),
                CURLOPT_WRITEFUNCTION => static function ($curl, string $chunk) use (&$content): int {
                    if (strlen($content) + strlen($chunk) > self::MAX_BYTES) { return 0; }
                    $content .= $chunk;
                    return strlen($chunk);
                },
            ]);
            $success = curl_exec($handle);
            $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
            curl_close($handle);
            if ($success === false || $status !== 200) { throw $this->unavailable(); }
            return $content;
        }
        $context = stream_context_create(['http' => [
            'method' => 'GET', 'header' => "Accept: application/json\r\nUser-Agent: " . Config::userAgent() . "\r\n",
            'timeout' => 15, 'follow_location' => 0, 'ignore_errors' => true,
        ]]);
        $content = @file_get_contents($url, false, $context, 0, self::MAX_BYTES + 1);
        $status = (string) ($http_response_header[0] ?? '');
        if ($content === false || strlen($content) > self::MAX_BYTES || !str_contains($status, ' 200 ')) { throw $this->unavailable(); }
        return $content;
    }

    /** @return array<string, mixed>|null */
    private function mapRow(mixed $row, string $type): ?array
    {
        if (!is_array($row)) { return null; }
        $start = (string) ($row['startDate'] ?? '');
        $end = (string) ($row['endDate'] ?? $start);
        if (!$this->date($start) || !$this->date($end) || $end < $start) { return null; }
        $name = $this->localizedName($row['name'] ?? null);
        if ($name === '') { return null; }
        $uid = trim((string) ($row['id'] ?? ''));
        if ($uid === '') { $uid = hash('sha256', $type . '|' . $name . '|' . $start . '|' . $end); }
        $exclusiveEnd = (new \DateTimeImmutable($end))->modify('+1 day')->format('Y-m-d');
        return [
            'uuid' => $uid,
            'title' => $name,
            'description' => $type === 'PUBLIC' ? 'Gesetzlicher Feiertag · Daten: OpenHolidays API' : 'Schulferien · Daten: OpenHolidays API',
            'location' => null,
            'starts_at' => $start . 'T00:00:00Z',
            'ends_at' => $exclusiveEnd . 'T00:00:00Z',
            'all_day' => 1,
            'is_private' => 0,
        ];
    }

    private function localizedName(mixed $value): string
    {
        if (!is_array($value)) { return ''; }
        $fallback = '';
        foreach ($value as $entry) {
            if (!is_array($entry)) { continue; }
            $text = trim((string) ($entry['text'] ?? ''));
            if ($fallback === '') { $fallback = $text; }
            if (strtoupper((string) ($entry['language'] ?? '')) === 'DE') { return $text; }
        }
        return $fallback;
    }

    private function date(string $value): bool
    {
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        return $date !== false && $date->format('Y-m-d') === $value;
    }

    private function unavailable(): AppException
    {
        return new AppException('HOLIDAY_PROVIDER_UNAVAILABLE', 'Der Ferien-Dienst ist vorübergehend nicht erreichbar. Vorhandene Kalenderdaten bleiben erhalten.', 502);
    }
}

