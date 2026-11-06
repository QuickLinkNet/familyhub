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
        public ?string $routinePeriod,
        /** @var list<int> */
        public array $repeatDays,
        public ?string $seriesId,
        public ?string $completedAt,
        public string $createdAt,
        public string $updatedAt
    ) {}

    public static function fromRow(array $row): self
    {
        $repeatDays = isset($row['repeat_days']) && is_string($row['repeat_days'])
            ? json_decode($row['repeat_days'], true)
            : [];
        return new self(
            $row['uuid'],
            $row['title'],
            $row['description'],
            $row['assigned_member_uuid'],
            $row['assigned_member_name'] ?? null,
            $row['assigned_member_color'] ?? null,
            $row['due_date'],
            $row['priority'],
            $row['status'],
            (bool) $row['requires_verification'],
            $row['routine_period'] ?? null,
            is_array($repeatDays) ? array_values(array_map('intval', $repeatDays)) : [],
            $row['series_uuid'] ?? null,
            $row['completed_at'],
            $row['created_at'],
            $row['updated_at']
        );
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
            'routinePeriod' => $this->routinePeriod,
            'repeatDays' => $this->repeatDays,
            'seriesId' => $this->seriesId,
            'completedAt' => $this->completedAt,
            'createdAt' => $this->createdAt,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
