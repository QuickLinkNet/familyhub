<?php
declare(strict_types=1);

namespace FamilyCompass\Models;

final class Calendar
{
    public function __construct(
        public string $uuid,
        public string $name,
        public string $color,
        public string $type,
        public ?string $ownerMemberId,
        public ?string $ownerMemberName,
        public bool $isActive
    ) {}

    public static function fromRow(array $row): self
    {
        return new self($row['uuid'], $row['name'], $row['color'], $row['calendar_type'], $row['owner_member_uuid'], $row['owner_member_name'] ?? null, (bool) $row['is_active']);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'color' => $this->color,
            'type' => $this->type,
            'ownerMember' => $this->ownerMemberId === null ? null : ['id' => $this->ownerMemberId, 'name' => $this->ownerMemberName],
            'isActive' => $this->isActive,
        ];
    }
}
