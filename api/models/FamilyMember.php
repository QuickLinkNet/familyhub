<?php
declare(strict_types=1);

namespace FamilyCompass\Models;

final class FamilyMember
{
    public function __construct(
        public string $uuid,
        public string $name,
        public string $color,
        public string $role,
        public bool $isActive,
        public ?string $avatarUrl,
        public ?string $birthDate,
        public string $createdAt,
        public string $updatedAt
    ) {}

    public static function fromRow(array $row): self
    {
        return new self(
            $row['uuid'],
            $row['name'],
            $row['color'],
            $row['role'],
            (bool) $row['is_active'],
            $row['avatar_url'],
            $row['birth_date'] ?? null,
            $row['created_at'],
            $row['updated_at']
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'color' => $this->color,
            'role' => $this->role,
            'isActive' => $this->isActive,
            'avatarUrl' => $this->avatarUrl,
            'birthDate' => $this->birthDate,
            'createdAt' => $this->createdAt,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
