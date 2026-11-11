<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;

final class WeatherService
{
    /** @return array{name: string, latitude: float, longitude: float} */
    public function resolveLocation(string $query): array
    {
        $url = 'https://geocoding-api.open-meteo.com/v1/search?' . http_build_query([
            'name' => $query, 'count' => 1, 'language' => 'de', 'format' => 'json',
        ]);
        $payload = $this->fetch($url);
        $result = $payload['results'][0] ?? null;
        if (!is_array($result) || !isset($result['latitude'], $result['longitude'], $result['name'])) {
            throw new AppException('WEATHER_LOCATION_NOT_FOUND', 'Der Wetterort wurde nicht gefunden. Bitte Ort oder Postleitzahl genauer angeben.', 422);
        }
        $parts = [(string) $result['name']];
        if (!empty($result['admin1']) && $result['admin1'] !== $result['name']) { $parts[] = (string) $result['admin1']; }
        return ['name' => implode(', ', $parts), 'latitude' => (float) $result['latitude'], 'longitude' => (float) $result['longitude']];
    }

    /** @return array<string, mixed>|null */
    public function current(float $latitude, float $longitude): ?array
    {
        try {
            $url = 'https://api.open-meteo.com/v1/forecast?' . http_build_query([
                'latitude' => $latitude,
                'longitude' => $longitude,
                'current' => 'temperature_2m,apparent_temperature,weather_code,is_day',
                'daily' => 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code',
                'timezone' => 'auto',
                'forecast_days' => 3,
            ]);
            $payload = $this->fetch($url);
            $current = $payload['current'] ?? null;
            $daily = $payload['daily'] ?? null;
            if (!is_array($current) || !is_array($daily)) { return null; }
            return [
                'temperature' => round((float) ($current['temperature_2m'] ?? 0)),
                'apparentTemperature' => round((float) ($current['apparent_temperature'] ?? 0)),
                'weatherCode' => (int) ($current['weather_code'] ?? 0),
                'isDay' => (bool) ($current['is_day'] ?? true),
                'forecast' => $this->forecast($daily),
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    /** @return list<array<string, int|string>> */
    private function forecast(array $daily): array
    {
        $days = [];
        foreach (($daily['time'] ?? []) as $index => $date) {
            $days[] = [
                'date' => (string) $date,
                'minimum' => (int) round((float) ($daily['temperature_2m_min'][$index] ?? 0)),
                'maximum' => (int) round((float) ($daily['temperature_2m_max'][$index] ?? 0)),
                'precipitationProbability' => (int) ($daily['precipitation_probability_max'][$index] ?? 0),
                'weatherCode' => (int) ($daily['weather_code'][$index] ?? 0),
            ];
        }
        return $days;
    }

    /** @return array<string, mixed> */
    private function fetch(string $url): array
    {
        $json = false;
        if (function_exists('curl_init')) {
            $handle = curl_init($url);
            if ($handle !== false) {
                curl_setopt_array($handle, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_TIMEOUT => 6, CURLOPT_USERAGENT => 'FamilyHub/0.17']);
                $json = curl_exec($handle);
                $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
                curl_close($handle);
                if ($status < 200 || $status >= 300) { $json = false; }
            }
        }
        if ($json === false) {
            $context = stream_context_create(['http' => ['timeout' => 6, 'user_agent' => 'FamilyHub/0.17']]);
            $json = @file_get_contents($url, false, $context);
        }
        if ($json === false) { throw new AppException('WEATHER_UNAVAILABLE', 'Der Wetterdienst ist gerade nicht erreichbar.', 503); }
        try { $data = json_decode($json, true, 512, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('WEATHER_UNAVAILABLE', 'Der Wetterdienst hat ungültige Daten geliefert.', 503); }
        if (!is_array($data)) { throw new AppException('WEATHER_UNAVAILABLE', 'Der Wetterdienst hat ungültige Daten geliefert.', 503); }
        return $data;
    }
}
