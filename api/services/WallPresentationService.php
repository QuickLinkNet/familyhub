<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Config\Config;
use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\WallPresentationRepository;

final class WallPresentationService
{
    private const MAX_PHOTOS = 8;
    private const MAX_FILE_SIZE = 8_388_608;
    private const MIME_EXTENSIONS = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

    public function __construct(
        private WallPresentationRepository $repository,
        private WeatherService $weather,
        private Config $config
    ) {}

    /** @return array<string, mixed> */
    public function presentation(): array
    {
        $settings = $this->settings();
        $weather = null;
        if ($settings['weatherEnabled'] && $settings['weatherLatitude'] !== null && $settings['weatherLongitude'] !== null) {
            $weather = $this->weather->current($settings['weatherLatitude'], $settings['weatherLongitude']);
        }
        return $settings + ['photos' => $this->photos(), 'weather' => $weather];
    }

    /** @return array<string, mixed> */
    public function administration(): array
    {
        return $this->settings() + ['photos' => $this->photos()];
    }

    /** @param array<string, mixed> $input @return array<string, mixed> */
    public function update(array $input): array
    {
        $greeting = trim((string) ($input['greeting'] ?? ''));
        $enabled = filter_var($input['weatherEnabled'] ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        $locationQuery = trim((string) ($input['weatherLocation'] ?? ''));
        if (mb_strlen($greeting) < 2 || mb_strlen($greeting) > 80 || $enabled === null || mb_strlen($locationQuery) > 100) {
            throw new AppException('VALIDATION_ERROR', 'Gruß, Wetteroption oder Ort ist ungültig.', 422);
        }
        $location = null;
        if ($enabled) {
            if (mb_strlen($locationQuery) < 2) { throw new AppException('VALIDATION_ERROR', 'Bitte einen Wetterort angeben.', 422); }
            $location = $this->weather->resolveLocation($locationQuery);
        }
        $this->repository->saveSettings([
            'greeting' => $greeting,
            'weather_enabled' => $enabled ? 1 : 0,
            'weather_location' => $location['name'] ?? null,
            'weather_latitude' => $location['latitude'] ?? null,
            'weather_longitude' => $location['longitude'] ?? null,
            'updated_at' => gmdate('c'),
        ]);
        return $this->administration();
    }

    /** @param array<string, mixed> $file @param array{id: string} $actor @return array<string, mixed> */
    public function upload(array $file, array $actor): array
    {
        if (count($this->repository->photos()) >= self::MAX_PHOTOS) {
            throw new AppException('PHOTO_LIMIT_REACHED', 'Im Wandmodus können höchstens acht Fotos gespeichert werden.', 409);
        }
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        $size = (int) ($file['size'] ?? 0);
        $temporary = (string) ($file['tmp_name'] ?? '');
        if ($error !== UPLOAD_ERR_OK || $size < 1 || $size > self::MAX_FILE_SIZE || !is_uploaded_file($temporary)) {
            throw new AppException('VALIDATION_ERROR', 'Bitte ein Foto mit höchstens 8 MB auswählen.', 422);
        }
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($temporary);
        if (!is_string($mime) || !isset(self::MIME_EXTENSIONS[$mime])) {
            throw new AppException('VALIDATION_ERROR', 'Unterstützt werden JPG-, PNG- und WebP-Fotos.', 422);
        }
        $uuid = $this->uuid();
        $storedName = $uuid . '.' . self::MIME_EXTENSIONS[$mime];
        $directory = $this->photoDirectory();
        if (!is_dir($directory) && !mkdir($directory, 0770, true) && !is_dir($directory)) {
            throw new AppException('PHOTO_STORAGE_FAILED', 'Der Fotospeicher konnte nicht angelegt werden.', 500);
        }
        if (!move_uploaded_file($temporary, $directory . DIRECTORY_SEPARATOR . $storedName)) {
            throw new AppException('PHOTO_STORAGE_FAILED', 'Das Foto konnte nicht gespeichert werden.', 500);
        }
        $this->repository->addPhoto([
            'uuid' => $uuid,
            'stored_name' => $storedName,
            'original_name' => mb_substr(basename((string) ($file['name'] ?? 'Familienfoto')), 0, 180),
            'mime_type' => $mime,
            'created_by_member_uuid' => $actor['id'],
            'created_at' => gmdate('c'),
        ]);
        return $this->administration();
    }

    /** @return array{path: string, mimeType: string} */
    public function photo(string $uuid): array
    {
        $photo = $this->repository->findPhoto($uuid) ?? throw new AppException('NOT_FOUND', 'Das Wandfoto wurde nicht gefunden.', 404);
        $path = $this->photoDirectory() . DIRECTORY_SEPARATOR . $photo['stored_name'];
        if (!is_file($path)) { throw new AppException('NOT_FOUND', 'Die Fotodatei wurde nicht gefunden.', 404); }
        return ['path' => $path, 'mimeType' => (string) $photo['mime_type']];
    }

    public function delete(string $uuid): void
    {
        $photo = $this->repository->deletePhoto($uuid) ?? throw new AppException('NOT_FOUND', 'Das Wandfoto wurde nicht gefunden.', 404);
        $path = $this->photoDirectory() . DIRECTORY_SEPARATOR . $photo['stored_name'];
        if (is_file($path)) { @unlink($path); }
    }

    /** @return array<string, mixed> */
    private function settings(): array
    {
        $settings = $this->repository->settings();
        return [
            'greeting' => (string) ($settings['greeting'] ?? 'Schön, dass ihr da seid'),
            'weatherEnabled' => (bool) ($settings['weather_enabled'] ?? false),
            'weatherLocation' => $settings['weather_location'] ?? null,
            'weatherLatitude' => isset($settings['weather_latitude']) ? (float) $settings['weather_latitude'] : null,
            'weatherLongitude' => isset($settings['weather_longitude']) ? (float) $settings['weather_longitude'] : null,
        ];
    }

    /** @return list<array<string, mixed>> */
    private function photos(): array
    {
        return array_map(static fn (array $photo): array => [
            'id' => $photo['uuid'], 'name' => $photo['original_name'], 'createdAt' => $photo['created_at'],
        ], $this->repository->photos());
    }

    private function photoDirectory(): string { return $this->config->wallPhotosPath(); }
    private function uuid(): string { $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); $hex = bin2hex($bytes); return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20)); }
}
