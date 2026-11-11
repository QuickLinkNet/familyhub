<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class WallPresentationRepository
{
    public function __construct(private PDO $database) {}

    /** @return array<string, mixed> */
    public function settings(): array
    {
        $row = $this->database->query('SELECT * FROM wall_presentation_settings WHERE id = 1')->fetch();
        return is_array($row) ? $row : [];
    }

    /** @param array<string, mixed> $settings */
    public function saveSettings(array $settings): void
    {
        $statement = $this->database->prepare(
            'UPDATE wall_presentation_settings
             SET greeting = :greeting, weather_enabled = :weather_enabled,
                 weather_location = :weather_location, weather_latitude = :weather_latitude,
                 weather_longitude = :weather_longitude, updated_at = :updated_at
             WHERE id = 1'
        );
        $statement->execute($settings);
    }

    /** @return list<array<string, mixed>> */
    public function photos(): array
    {
        return $this->database->query(
            'SELECT uuid, stored_name, original_name, mime_type, created_at
             FROM wall_photos WHERE deleted_at IS NULL ORDER BY created_at DESC'
        )->fetchAll();
    }

    /** @return array<string, mixed>|null */
    public function findPhoto(string $uuid): ?array
    {
        $statement = $this->database->prepare(
            'SELECT uuid, stored_name, original_name, mime_type, created_at
             FROM wall_photos WHERE uuid = :uuid AND deleted_at IS NULL LIMIT 1'
        );
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    /** @param array<string, mixed> $photo */
    public function addPhoto(array $photo): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO wall_photos (uuid, stored_name, original_name, mime_type, created_by_member_uuid, created_at)
             VALUES (:uuid, :stored_name, :original_name, :mime_type, :created_by_member_uuid, :created_at)'
        );
        $statement->execute($photo);
    }

    public function deletePhoto(string $uuid): ?array
    {
        $photo = $this->findPhoto($uuid);
        if ($photo === null) { return null; }
        $statement = $this->database->prepare(
            'UPDATE wall_photos SET deleted_at = :deleted_at WHERE uuid = :uuid AND deleted_at IS NULL'
        );
        $statement->execute(['uuid' => $uuid, 'deleted_at' => gmdate('c')]);
        return $statement->rowCount() === 1 ? $photo : null;
    }
}
