<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;

final class ReminderPlanner
{
    private const URGENCY_ORDER = ['CRITICAL' => 0, 'ATTENTION' => 1, 'INFO' => 2];

    /**
     * @param array{id: string, name: string, color: string, role: string} $actor
     * @param list<array<string, mixed>> $events
     * @param list<array<string, mixed>> $tasks
     * @param array<string, mixed> $routines
     * @param array<string, mixed> $school
     * @return array<string, mixed>
     */
    public function build(array $actor, array $events, array $tasks, array $routines, array $school, DateTimeImmutable $now): array
    {
        $items = array_merge(
            $this->events($events, $now),
            $this->tasks($tasks, $actor, $now),
            $this->school($school['items'] ?? [], $actor, $now),
            $this->routines($routines['runs'] ?? [], $actor, $now)
        );
        usort($items, fn (array $left, array $right): int => $this->sortKey($left) <=> $this->sortKey($right));
        $items = array_slice($items, 0, 12);

        $summary = ['total' => count($items), 'critical' => 0, 'attention' => 0, 'info' => 0];
        foreach ($items as $item) { $summary[strtolower((string) $item['urgency'])]++; }

        return [
            'generatedAt' => $now->format(DATE_ATOM),
            'audience' => ['id' => $actor['id'], 'name' => $actor['name'], 'role' => $actor['role']],
            'headline' => $this->headline($summary),
            'summary' => $summary,
            'items' => $items,
        ];
    }

    /** @param list<array<string, mixed>> $events @return list<array<string, mixed>> */
    private function events(array $events, DateTimeImmutable $now): array
    {
        $items = [];
        foreach ($events as $event) {
            $start = $this->date((string) ($event['startsAt'] ?? ''));
            $end = $this->date((string) ($event['endsAt'] ?? ''));
            if ($start === null || $end === null || $end <= $now) { continue; }
            $hours = ($start->getTimestamp() - $now->getTimestamp()) / 3600;
            $items[] = $this->item(
                'EVENT',
                (string) ($event['id'] ?? ''),
                $hours <= 2 ? 'ATTENTION' : 'INFO',
                (string) ($event['title'] ?? 'Termin'),
                $event['location'] ? 'Termin · ' . $event['location'] : 'Termin im Familienkalender',
                $start->format(DATE_ATOM),
                '/calendar',
                'Kalender öffnen'
            );
        }
        return array_slice($items, 0, 3);
    }

    /** @param list<array<string, mixed>> $tasks @param array{id: string, role: string} $actor @return list<array<string, mixed>> */
    private function tasks(array $tasks, array $actor, DateTimeImmutable $now): array
    {
        $items = []; $today = $now->format('Y-m-d'); $tomorrow = $now->modify('+1 day')->format('Y-m-d');
        foreach ($tasks as $task) {
            $member = is_array($task['assignedMember'] ?? null) ? $task['assignedMember'] : null;
            if (!$this->visibleFor($actor, $member) || ($task['status'] ?? '') === 'COMPLETED') { continue; }
            if (($task['status'] ?? '') === 'PENDING_VERIFICATION') {
                if ($actor['role'] === 'CHILD') { continue; }
                $items[] = $this->item('VERIFICATION', (string) $task['id'], 'ATTENTION', (string) $task['title'], $this->memberText('Aufgabe wartet auf Bestätigung', $member), (string) ($task['completedAt'] ?? $now->format(DATE_ATOM)), '/tasks', 'Aufgabe prüfen', $member);
                continue;
            }
            $dueDate = (string) ($task['dueDate'] ?? '');
            if ($dueDate === '' || $dueDate > $tomorrow) { continue; }
            $urgency = $dueDate < $today ? 'CRITICAL' : ($dueDate === $today ? 'ATTENTION' : 'INFO');
            $label = $dueDate < $today ? 'Aufgabe ist überfällig' : ($dueDate === $today ? 'Heute fällig' : 'Morgen fällig');
            $items[] = $this->item('TASK', (string) $task['id'], $urgency, (string) $task['title'], $this->memberText($label, $member), $dueDate . 'T12:00:00' . $now->format('P'), '/tasks', 'Aufgaben öffnen', $member);
        }
        return $items;
    }

    /** @param list<array<string, mixed>> $schoolItems @param array{id: string, role: string} $actor @return list<array<string, mixed>> */
    private function school(array $schoolItems, array $actor, DateTimeImmutable $now): array
    {
        $items = []; $today = $now->format('Y-m-d');
        foreach ($schoolItems as $schoolItem) {
            $member = is_array($schoolItem['member'] ?? null) ? $schoolItem['member'] : null;
            if (($schoolItem['completedAt'] ?? null) !== null || !$this->visibleFor($actor, $member)) { continue; }
            $dueDate = (string) ($schoolItem['dueDate'] ?? '');
            $isTest = ($schoolItem['itemType'] ?? '') === 'TEST';
            $urgency = $dueDate < $today ? 'CRITICAL' : ($dueDate === $today || $isTest ? 'ATTENTION' : 'INFO');
            $kind = $isTest ? 'Test' : 'Hausaufgabe';
            $items[] = $this->item('SCHOOL', (string) $schoolItem['id'], $urgency, (string) $schoolItem['title'], $this->memberText($kind . ' · ' . (string) ($schoolItem['subject'] ?? 'Schule'), $member), $dueDate . 'T12:00:00' . $now->format('P'), '/school', 'Schule öffnen', $member);
        }
        return $items;
    }

    /** @param list<array<string, mixed>> $runs @param array{id: string, role: string} $actor @return list<array<string, mixed>> */
    private function routines(array $runs, array $actor, DateTimeImmutable $now): array
    {
        $items = [];
        foreach ($runs as $run) {
            $member = is_array($run['assignedMember'] ?? null) ? $run['assignedMember'] : null;
            if (($run['status'] ?? '') === 'COMPLETED' || !$this->visibleFor($actor, $member)) { continue; }
            $period = (string) ($run['routinePeriod'] ?? '');
            $hour = ['MORNING' => 10, 'AFTERNOON' => 17, 'EVENING' => 21][$period] ?? 21;
            $due = $now->setTime($hour, 0);
            $urgency = $now > $due ? 'CRITICAL' : ($due->getTimestamp() - $now->getTimestamp() <= 7200 ? 'ATTENTION' : 'INFO');
            $progress = is_array($run['progress'] ?? null) ? $run['progress'] : [];
            $message = sprintf('Routine · %d von %d Schritten erledigt', (int) ($progress['completed'] ?? 0), (int) ($progress['total'] ?? 0));
            $items[] = $this->item('ROUTINE', (string) $run['id'], $urgency, (string) $run['title'], $this->memberText($message, $member), $due->format(DATE_ATOM), '/tasks', 'Routine öffnen', $member);
        }
        return $items;
    }

    /** @param array{id: string, role: string} $actor @param array<string, mixed>|null $member */
    private function visibleFor(array $actor, ?array $member): bool
    {
        return $actor['role'] !== 'CHILD' || ($member['id'] ?? null) === $actor['id'];
    }

    /** @param array<string, mixed>|null $member */
    private function memberText(string $text, ?array $member): string
    {
        return $member === null ? $text : $text . ' · ' . (string) ($member['name'] ?? 'Familie');
    }

    /** @param array<string, mixed>|null $member @return array<string, mixed> */
    private function item(string $type, string $id, string $urgency, string $title, string $message, string $dueAt, string $href, string $actionLabel, ?array $member = null): array
    {
        return ['id' => $type . ':' . $id, 'type' => $type, 'urgency' => $urgency, 'title' => $title, 'message' => $message, 'dueAt' => $dueAt, 'member' => $member, 'action' => ['href' => $href, 'label' => $actionLabel]];
    }

    /** @param array<string, mixed> $item @return array{int, string, string} */
    private function sortKey(array $item): array
    {
        return [self::URGENCY_ORDER[(string) $item['urgency']] ?? 9, (string) $item['dueAt'], (string) $item['title']];
    }

    /** @param array<string, int> $summary */
    private function headline(array $summary): string
    {
        if ($summary['total'] === 0) { return 'Alles im grünen Bereich'; }
        if ($summary['critical'] > 0) { return $summary['critical'] === 1 ? 'Eine Sache braucht Aufmerksamkeit' : $summary['critical'] . ' Dinge brauchen Aufmerksamkeit'; }
        return $summary['total'] === 1 ? 'Ein Hinweis für dich' : $summary['total'] . ' Hinweise für dich';
    }

    private function date(string $value): ?DateTimeImmutable
    {
        try { return $value === '' ? null : new DateTimeImmutable($value); }
        catch (\Throwable) { return null; }
    }
}
