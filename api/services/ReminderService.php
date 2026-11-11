<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use DateTimeZone;
use FamilyCompass\Repositories\TaskRepository;

final class ReminderService
{
    public function __construct(
        private CalendarService $calendar,
        private TaskService $tasks,
        private RoutineService $routines,
        private SchoolService $school,
        private TaskRepository $taskRepository,
        private ReminderPlanner $planner
    ) {}

    /** @param array{id: string, name: string, color: string, role: string} $actor @return array<string, mixed> */
    public function overview(array $actor): array
    {
        $timezone = $this->timezone();
        $now = new DateTimeImmutable('now', $timezone);
        $today = $now->format('Y-m-d');

        return $this->planner->build(
            $actor,
            $this->calendar->events($this->iso($now->modify('-6 hours')), $this->iso($now->modify('+36 hours'))),
            $this->tasks->list(),
            $this->routines->overview(),
            $this->school->board($today, $now->modify('+3 days')->format('Y-m-d')),
            $now
        );
    }

    private function timezone(): DateTimeZone
    {
        try { return new DateTimeZone($this->taskRepository->householdTimezone()); }
        catch (\Throwable) { return new DateTimeZone('Europe/Berlin'); }
    }

    private function iso(DateTimeImmutable $date): string
    {
        return $date->format('Y-m-d\TH:i:sP');
    }
}
