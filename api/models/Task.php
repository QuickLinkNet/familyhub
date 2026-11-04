<?php
declare(strict_types=1);

namespace FamilyCompass\Models;

final class Task
{
    public function __construct(
        public string $uuid,
        public string $title,
        public ?string $description,
        public ?string $assignedMemberId,
        public ?string $assignedMemberName,
        public ?string $assignedMemberColor,
        public ?string $dueDate,
        public string $priority,
        public string $status,
        public bool $requiresVerification,
        public ?string $completedAt,
        public string $createdAt,
        public string $updatedAt
    ) {}

    public static function fromRow(array $row): self
    {
        return new self($row['uuid'], $row['title'], $row['description'], $row['assigned_member_uuid'], $row['assigned_member_name'] ?? null, $row['assigned_member_color'] ?? null, $row['due_date'], $row['priority'], $row['status'], (bool) $row['requires_verification'], $row['completed_at'], $row['created_at'], $row['updated_at']);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->uuid,
            'title' => $this->title,
            'description' => $this->description,
            'assignedMember' => $this->assignedMemberId === null ? null : ['id' => $this->assignedMemberId, 'name' => $this->assignedMemberName, 'color' => $this->assignedMemberColor],
            'dueDate' => $this->dueDate,
            'priority' => $this->priority,
            'status' => $this->status,
            'requiresVerification' => $this->requiresVerification,
            'completedAt' => $this->completedAt,
            'createdAt' => $this->createdAt,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
