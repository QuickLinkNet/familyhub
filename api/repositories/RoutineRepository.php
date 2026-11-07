<?php
declare(strict_types=1);

namespace FamilyCompass\Repositories;

use PDO;

final class RoutineRepository
{
    public function __construct(private PDO $database) {}

    /** @return list<array<string, mixed>> */
    public function templates(bool $activeOnly = false): array
    {
        $where = $activeOnly ? 'AND rt.is_active = 1' : '';
        $rows = $this->database->query("SELECT rt.*, fm.name AS assigned_member_name, fm.color AS assigned_member_color FROM routine_templates rt JOIN family_members fm ON fm.uuid = rt.assigned_member_uuid WHERE rt.deleted_at IS NULL {$where} ORDER BY rt.routine_period, rt.title COLLATE NOCASE")->fetchAll();
        return array_map(fn (array $row): array => $this->mapTemplate($row), $rows);
    }

    /** @return array<string, mixed>|null */
    public function findTemplate(string $uuid): ?array
    {
        $statement = $this->database->prepare('SELECT rt.*, fm.name AS assigned_member_name, fm.color AS assigned_member_color FROM routine_templates rt JOIN family_members fm ON fm.uuid = rt.assigned_member_uuid WHERE rt.uuid = :uuid AND rt.deleted_at IS NULL LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $this->mapTemplate($row);
    }

    /** @param array<string, mixed> $data @param list<array<string, mixed>> $steps */
    public function createTemplate(array $data, array $steps): void
    {
        $this->database->beginTransaction();
        try {
            $statement = $this->database->prepare('INSERT INTO routine_templates (uuid, title, description, assigned_member_uuid, routine_period, repeat_days, is_active, created_at, updated_at) VALUES (:uuid, :title, :description, :assigned_member_uuid, :routine_period, :repeat_days, :is_active, :created_at, :updated_at)');
            $statement->execute($data);
            $this->insertSteps($data['uuid'], $steps);
            $this->database->commit();
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    /** @param array<string, mixed> $data @param list<array<string, mixed>> $steps */
    public function updateTemplate(string $uuid, array $data, array $steps): bool
    {
        $this->database->beginTransaction();
        try {
            $statement = $this->database->prepare('UPDATE routine_templates SET title = :title, description = :description, assigned_member_uuid = :assigned_member_uuid, routine_period = :routine_period, repeat_days = :repeat_days, is_active = :is_active, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
            $statement->execute($data + ['uuid' => $uuid]);
            if ($statement->rowCount() !== 1 && $this->findTemplate($uuid) === null) { $this->database->rollBack(); return false; }
            $deleted = $this->database->prepare('UPDATE routine_steps SET deleted_at = :deleted_at, updated_at = :updated_at WHERE template_uuid = :uuid AND deleted_at IS NULL');
            $deleted->execute(['uuid' => $uuid, 'deleted_at' => $data['updated_at'], 'updated_at' => $data['updated_at']]);
            $this->insertSteps($uuid, $steps);
            $this->database->commit();
            return true;
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    public function softDeleteTemplate(string $uuid): bool
    {
        $now = gmdate('c');
        $statement = $this->database->prepare('UPDATE routine_templates SET deleted_at = :deleted_at, is_active = 0, updated_at = :updated_at WHERE uuid = :uuid AND deleted_at IS NULL');
        $statement->execute(['uuid' => $uuid, 'deleted_at' => $now, 'updated_at' => $now]);
        return $statement->rowCount() === 1;
    }

    /** @param array<string, mixed> $template */
    public function materialize(array $template, string $date, string $runUuid, array $stepUuids): void
    {
        $now = gmdate('c');
        $this->database->beginTransaction();
        try {
            $run = $this->database->prepare('INSERT OR IGNORE INTO routine_runs (uuid, template_uuid, due_date, status, created_at, updated_at) VALUES (:uuid, :template_uuid, :due_date, \'OPEN\', :created_at, :updated_at)');
            $run->execute(['uuid' => $runUuid, 'template_uuid' => $template['id'], 'due_date' => $date, 'created_at' => $now, 'updated_at' => $now]);
            if ($run->rowCount() === 1) {
                $insert = $this->database->prepare('INSERT INTO routine_run_steps (uuid, run_uuid, template_step_uuid, title, position, status, created_at, updated_at) VALUES (:uuid, :run_uuid, :template_step_uuid, :title, :position, \'OPEN\', :created_at, :updated_at)');
                foreach ($template['steps'] as $index => $step) {
                    $insert->execute(['uuid' => $stepUuids[$index], 'run_uuid' => $runUuid, 'template_step_uuid' => $step['id'], 'title' => $step['title'], 'position' => $step['position'], 'created_at' => $now, 'updated_at' => $now]);
                }
            }
            $this->database->commit();
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    /** @return list<array<string, mixed>> */
    public function runsForDate(string $date): array
    {
        $statement = $this->database->prepare('SELECT rr.*, rt.title, rt.description, rt.routine_period, rt.assigned_member_uuid, fm.name AS assigned_member_name, fm.color AS assigned_member_color FROM routine_runs rr JOIN routine_templates rt ON rt.uuid = rr.template_uuid JOIN family_members fm ON fm.uuid = rt.assigned_member_uuid WHERE rr.due_date = :due_date ORDER BY rt.routine_period, rt.title COLLATE NOCASE');
        $statement->execute(['due_date' => $date]);
        return array_map(fn (array $row): array => $this->mapRun($row), $statement->fetchAll());
    }

    /** @return array<string, mixed>|null */
    public function findRun(string $uuid): ?array
    {
        $statement = $this->database->prepare('SELECT rr.*, rt.title, rt.description, rt.routine_period, rt.assigned_member_uuid, fm.name AS assigned_member_name, fm.color AS assigned_member_color FROM routine_runs rr JOIN routine_templates rt ON rt.uuid = rr.template_uuid JOIN family_members fm ON fm.uuid = rt.assigned_member_uuid WHERE rr.uuid = :uuid LIMIT 1');
        $statement->execute(['uuid' => $uuid]);
        $row = $statement->fetch();
        return $row === false ? null : $this->mapRun($row);
    }

    public function completeStep(string $runUuid, string $stepUuid, string $actorUuid): bool
    {
        $now = gmdate('c');
        $this->database->beginTransaction();
        try {
            $step = $this->database->prepare('UPDATE routine_run_steps SET status = \'COMPLETED\', completed_by_member_uuid = :actor_uuid, completed_at = :completed_at, updated_at = :updated_at WHERE uuid = :uuid AND run_uuid = :run_uuid AND status = \'OPEN\'');
            $step->execute(['uuid' => $stepUuid, 'run_uuid' => $runUuid, 'actor_uuid' => $actorUuid, 'completed_at' => $now, 'updated_at' => $now]);
            if ($step->rowCount() !== 1) { $this->database->rollBack(); return false; }
            $remaining = $this->database->prepare('SELECT COUNT(*) FROM routine_run_steps WHERE run_uuid = :run_uuid AND status = \'OPEN\'');
            $remaining->execute(['run_uuid' => $runUuid]);
            if ((int) $remaining->fetchColumn() === 0) {
                $run = $this->database->prepare('UPDATE routine_runs SET status = \'COMPLETED\', completed_at = :completed_at, updated_at = :updated_at WHERE uuid = :uuid');
                $run->execute(['uuid' => $runUuid, 'completed_at' => $now, 'updated_at' => $now]);
            }
            $this->database->commit();
            return true;
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) { $this->database->rollBack(); }
            throw $error;
        }
    }

    public function householdTimezone(): string
    {
        $timezone = $this->database->query('SELECT timezone FROM households ORDER BY id LIMIT 1')->fetchColumn();
        return is_string($timezone) && $timezone !== '' ? $timezone : 'Europe/Berlin';
    }

    /** @param list<array<string, mixed>> $steps */
    private function insertSteps(string $templateUuid, array $steps): void
    {
        $statement = $this->database->prepare('INSERT INTO routine_steps (uuid, template_uuid, title, position, created_at, updated_at) VALUES (:uuid, :template_uuid, :title, :position, :created_at, :updated_at)');
        foreach ($steps as $step) { $statement->execute($step + ['template_uuid' => $templateUuid]); }
    }

    /** @return list<array<string, mixed>> */
    private function steps(string $templateUuid): array
    {
        $statement = $this->database->prepare('SELECT uuid AS id, title, position FROM routine_steps WHERE template_uuid = :uuid AND deleted_at IS NULL ORDER BY position');
        $statement->execute(['uuid' => $templateUuid]);
        return $statement->fetchAll();
    }

    /** @return list<array<string, mixed>> */
    private function runSteps(string $runUuid): array
    {
        $statement = $this->database->prepare('SELECT uuid AS id, title, position, status, completed_at AS completedAt FROM routine_run_steps WHERE run_uuid = :uuid ORDER BY position');
        $statement->execute(['uuid' => $runUuid]);
        return array_map(static fn (array $row): array => $row + ['completedAt' => $row['completedAt']], $statement->fetchAll());
    }

    /** @return array<string, mixed> */
    private function mapTemplate(array $row): array
    {
        return ['id' => $row['uuid'], 'title' => $row['title'], 'description' => $row['description'], 'assignedMember' => ['id' => $row['assigned_member_uuid'], 'name' => $row['assigned_member_name'], 'color' => $row['assigned_member_color']], 'routinePeriod' => $row['routine_period'], 'repeatDays' => json_decode($row['repeat_days'], true, 512, JSON_THROW_ON_ERROR), 'isActive' => (bool) $row['is_active'], 'steps' => $this->steps($row['uuid']), 'createdAt' => $row['created_at'], 'updatedAt' => $row['updated_at']];
    }

    /** @return array<string, mixed> */
    private function mapRun(array $row): array
    {
        $steps = $this->runSteps($row['uuid']);
        $completed = count(array_filter($steps, static fn (array $step): bool => $step['status'] === 'COMPLETED'));
        return ['id' => $row['uuid'], 'templateId' => $row['template_uuid'], 'title' => $row['title'], 'description' => $row['description'], 'assignedMember' => ['id' => $row['assigned_member_uuid'], 'name' => $row['assigned_member_name'], 'color' => $row['assigned_member_color']], 'routinePeriod' => $row['routine_period'], 'dueDate' => $row['due_date'], 'status' => $row['status'], 'steps' => $steps, 'progress' => ['completed' => $completed, 'total' => count($steps)], 'completedAt' => $row['completed_at']];
    }
}
