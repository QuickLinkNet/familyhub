<?php
declare(strict_types=1);

namespace FamilyHub\Services;

use DateInterval;
use DateTimeImmutable;
use DateTimeZone;
use FamilyHub\Models\CalendarEvent;

final class CalendarRecurrenceExpander
{
    /** @return list<array<string, mixed>> */
    public function expand(CalendarEvent $event, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        if ($event->recurrenceFrequency === null) {
            return [$event->toArray()];
        }

        $start = new DateTimeImmutable($event->startsAt);
        $duration = (new DateTimeImmutable($event->endsAt))->getTimestamp() - $start->getTimestamp();
        $until = $event->recurrenceUntil === null ? null : new DateTimeImmutable($event->recurrenceUntil . 'T23:59:59Z');
        if ($event->recurrenceFrequency === 'WEEKLY') {
            return $this->expandWeekly($event, $start, $duration, $until, $from, $to);
        }
        $occurrences = [];

        $index = $this->firstRelevantIndex($start, $from->modify('-' . $duration . ' seconds'), $event->recurrenceFrequency, $event->recurrenceInterval);
        for ($count = 0; $count < 5000; $count++, $index++) {
            $occurrenceStart = $this->occurrenceStart($start, $event->recurrenceFrequency, $event->recurrenceInterval, $index);
            if ($occurrenceStart === null) {
                continue;
            }
            if ($occurrenceStart >= $to || ($until !== null && $occurrenceStart > $until)) {
                break;
            }
            $occurrenceEnd = $occurrenceStart->modify('+' . $duration . ' seconds');
            if ($occurrenceEnd <= $from) {
                continue;
            }

            $occurrences[] = $this->occurrence($event, $occurrenceStart, $occurrenceEnd);
        }
        return $occurrences;
    }

    /** @return list<array<string, mixed>> */
    private function expandWeekly(CalendarEvent $event, DateTimeImmutable $start, int $duration, ?DateTimeImmutable $until, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $weekdays = $event->recurrenceWeekdays === [] ? [(int) $start->format('N')] : $event->recurrenceWeekdays;
        sort($weekdays);
        $weekStart = $start->modify('monday this week')->setTime((int) $start->format('H'), (int) $start->format('i'), (int) $start->format('s'));
        $relevantFrom = $from->modify('-' . $duration . ' seconds');
        $elapsedDays = max(0, intdiv($relevantFrom->getTimestamp() - $weekStart->getTimestamp(), 86400));
        $firstCycle = max(0, intdiv($elapsedDays, 7 * $event->recurrenceInterval) - 1);
        $occurrences = [];

        for ($count = 0, $cycle = $firstCycle; $count < 5000; $count++, $cycle++) {
            $cycleStart = $weekStart->add(new DateInterval('P' . ($cycle * $event->recurrenceInterval * 7) . 'D'));
            if ($cycleStart >= $to) { break; }
            foreach ($weekdays as $weekday) {
                $occurrenceStart = $cycleStart->add(new DateInterval('P' . ($weekday - 1) . 'D'));
                if ($occurrenceStart < $start || $occurrenceStart >= $to) { continue; }
                if ($until !== null && $occurrenceStart > $until) { return $occurrences; }
                $occurrenceEnd = $occurrenceStart->modify('+' . $duration . ' seconds');
                if ($occurrenceEnd <= $from) { continue; }
                $occurrences[] = $this->occurrence($event, $occurrenceStart, $occurrenceEnd);
            }
        }
        return $occurrences;
    }

    /** @return array<string, mixed> */
    private function occurrence(CalendarEvent $event, DateTimeImmutable $start, DateTimeImmutable $end): array
    {
        $item = $event->toArray();
        $item['id'] = $event->uuid . '::' . $start->format('Ymd\THis');
        $item['seriesId'] = $event->uuid;
        $item['seriesStartsAt'] = $event->startsAt;
        $item['seriesEndsAt'] = $event->endsAt;
        $item['startsAt'] = $this->utc($start);
        $item['endsAt'] = $this->utc($end);
        return $item;
    }

    private function firstRelevantIndex(DateTimeImmutable $start, DateTimeImmutable $from, string $frequency, int $interval): int
    {
        if ($from <= $start) {
            return 0;
        }
        if ($frequency === 'DAILY' || $frequency === 'WEEKLY') {
            $step = $interval * ($frequency === 'WEEKLY' ? 7 : 1);
            $days = intdiv($from->getTimestamp() - $start->getTimestamp(), 86400);
            return max(0, intdiv($days, $step) - 1);
        }
        if ($frequency === 'MONTHLY') {
            $months = ((int) $from->format('Y') - (int) $start->format('Y')) * 12 + (int) $from->format('n') - (int) $start->format('n');
            return max(0, intdiv($months, $interval) - 1);
        }
        $years = (int) $from->format('Y') - (int) $start->format('Y');
        return max(0, intdiv($years, $interval) - 1);
    }

    private function occurrenceStart(DateTimeImmutable $start, string $frequency, int $interval, int $index): ?DateTimeImmutable
    {
        if ($index === 0) {
            return $start;
        }
        $amount = $interval * $index;
        if ($frequency === 'DAILY') {
            return $start->add(new DateInterval('P' . $amount . 'D'));
        }
        if ($frequency === 'WEEKLY') {
            return $start->add(new DateInterval('P' . ($amount * 7) . 'D'));
        }
        if ($frequency === 'MONTHLY') {
            $monthIndex = ((int) $start->format('Y')) * 12 + ((int) $start->format('n') - 1) + $amount;
            $year = intdiv($monthIndex, 12);
            $month = $monthIndex % 12 + 1;
            return $this->withDate($start, $year, $month, (int) $start->format('j'));
        }
        $year = (int) $start->format('Y') + $amount;
        return $this->withDate($start, $year, (int) $start->format('n'), (int) $start->format('j'));
    }

    private function withDate(DateTimeImmutable $start, int $year, int $month, int $day): ?DateTimeImmutable
    {
        $monthLength = (int) $start->setDate($year, $month, 1)->format('t');
        if ($day > $monthLength) {
            return null;
        }
        return $start->setDate($year, $month, $day);
    }

    private function utc(DateTimeImmutable $date): string
    {
        return $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
    }
}
