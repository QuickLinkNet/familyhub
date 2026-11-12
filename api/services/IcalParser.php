<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateInterval;
use DateTimeImmutable;
use DateTimeZone;
use FamilyCompass\Core\AppException;

final class IcalParser
{
    /** @return list<array<string, mixed>> */
    public function parse(string $content, DateTimeImmutable $windowStart, DateTimeImmutable $windowEnd, string $defaultTimezone): array
    {
        try { $fallbackZone = new DateTimeZone($defaultTimezone); }
        catch (\Throwable) { $fallbackZone = new DateTimeZone('Europe/Berlin'); }

        $normalised = str_replace(["\r\n", "\r"], "\n", $content);
        $normalised = preg_replace("/\n[ \t]/", '', $normalised) ?? $normalised;
        preg_match_all('/BEGIN:VEVENT\n(.*?)\nEND:VEVENT/s', $normalised, $matches);
        $items = [];
        foreach ($matches[1] ?? [] as $block) {
            $item = $this->parseEvent((string) $block, $fallbackZone);
            if ($item !== null) { $items[] = $item; }
        }

        $overrides = [];
        foreach ($items as $item) {
            if ($item['recurrenceId'] instanceof DateTimeImmutable) {
                $overrides[$item['uid'] . '|' . $item['recurrenceId']->getTimestamp()] = $item;
            }
        }

        $events = [];
        foreach ($items as $item) {
            if ($item['recurrenceId'] instanceof DateTimeImmutable || $item['status'] === 'CANCELLED') { continue; }
            $starts = $item['rrule'] === null
                ? [$item['start']]
                : $this->occurrences($item['start'], $item['rrule'], $windowEnd, $fallbackZone);
            foreach ($starts as $start) {
                $key = $item['uid'] . '|' . $start->getTimestamp();
                if (isset($overrides[$key]) || isset($item['exdates'][$start->getTimestamp()])) { continue; }
                $this->appendOccurrence($events, $item, $start, $windowStart, $windowEnd);
            }
        }
        foreach ($overrides as $item) {
            if ($item['status'] !== 'CANCELLED') {
                $this->appendOccurrence($events, $item, $item['start'], $windowStart, $windowEnd);
            }
        }
        usort($events, static fn (array $a, array $b): int => [$a['starts_at'], $a['title']] <=> [$b['starts_at'], $b['title']]);
        if (count($events) > 20_000) {
            throw new AppException('CALENDAR_SYNC_FAILED', 'Der Kalender enthält zu viele Termine für einen sicheren Import.', 422);
        }
        return $events;
    }

    /** @return array<string, mixed>|null */
    private function parseEvent(string $block, DateTimeZone $fallbackZone): ?array
    {
        $properties = [];
        foreach (explode("\n", $block) as $line) {
            $separator = strpos($line, ':');
            if ($separator === false) { continue; }
            $definition = substr($line, 0, $separator);
            $value = substr($line, $separator + 1);
            $parts = explode(';', $definition);
            $name = strtoupper((string) array_shift($parts));
            $parameters = [];
            foreach ($parts as $part) {
                [$key, $parameterValue] = array_pad(explode('=', $part, 2), 2, '');
                $parameters[strtoupper($key)] = trim($parameterValue, '"');
            }
            $properties[$name][] = ['value' => $value, 'parameters' => $parameters];
        }
        if (!isset($properties['DTSTART'][0])) { return null; }
        $startInfo = $this->dateValue($properties['DTSTART'][0], $fallbackZone);
        $start = $startInfo['date'];
        $allDay = $startInfo['allDay'];
        $end = isset($properties['DTEND'][0])
            ? $this->dateValue($properties['DTEND'][0], $fallbackZone)['date']
            : $start->add(new DateInterval($allDay ? 'P1D' : 'PT1H'));
        if ($end <= $start) { $end = $start->add(new DateInterval($allDay ? 'P1D' : 'PT1H')); }

        $uid = trim((string) ($properties['UID'][0]['value'] ?? hash('sha256', $block)));
        $exdates = [];
        foreach ($properties['EXDATE'] ?? [] as $property) {
            foreach (explode(',', $property['value']) as $value) {
                $date = $this->dateValue(['value' => $value, 'parameters' => $property['parameters']], $fallbackZone)['date'];
                $exdates[$date->getTimestamp()] = true;
            }
        }
        $recurrenceId = isset($properties['RECURRENCE-ID'][0])
            ? $this->dateValue($properties['RECURRENCE-ID'][0], $fallbackZone)['date']
            : null;
        return [
            'uid' => mb_substr($uid, 0, 512),
            'title' => mb_substr($this->text((string) ($properties['SUMMARY'][0]['value'] ?? 'Termin')), 0, 140),
            'description' => $this->nullableText((string) ($properties['DESCRIPTION'][0]['value'] ?? ''), 2_000),
            'location' => $this->nullableText((string) ($properties['LOCATION'][0]['value'] ?? ''), 160),
            'start' => $start,
            'end' => $end,
            'duration' => max(60, $end->getTimestamp() - $start->getTimestamp()),
            'allDay' => $allDay,
            'isPrivate' => in_array(strtoupper((string) ($properties['CLASS'][0]['value'] ?? 'PUBLIC')), ['PRIVATE', 'CONFIDENTIAL'], true),
            'rrule' => isset($properties['RRULE'][0]) ? $this->rule((string) $properties['RRULE'][0]['value'], $fallbackZone) : null,
            'recurrenceId' => $recurrenceId,
            'exdates' => $exdates,
            'status' => strtoupper((string) ($properties['STATUS'][0]['value'] ?? 'CONFIRMED')),
        ];
    }

    /** @param array{value: string, parameters: array<string, string>} $property
     *  @return array{date: DateTimeImmutable, allDay: bool}
     */
    private function dateValue(array $property, DateTimeZone $fallbackZone): array
    {
        $value = trim($property['value']);
        $allDay = ($property['parameters']['VALUE'] ?? '') === 'DATE' || preg_match('/^\d{8}$/', $value) === 1;
        $timezoneName = $property['parameters']['TZID'] ?? null;
        try { $timezone = $timezoneName === null ? $fallbackZone : new DateTimeZone($timezoneName); }
        catch (\Throwable) { $timezone = $fallbackZone; }
        $formats = $allDay ? ['!Ymd'] : (str_ends_with($value, 'Z') ? ['!Ymd\THis\Z', '!Ymd\THi\Z'] : ['!Ymd\THis', '!Ymd\THi']);
        if (str_ends_with($value, 'Z')) { $timezone = new DateTimeZone('UTC'); }
        foreach ($formats as $format) {
            $date = DateTimeImmutable::createFromFormat($format, $value, $timezone);
            if ($date instanceof DateTimeImmutable) { return ['date' => $date, 'allDay' => $allDay]; }
        }
        throw new AppException('CALENDAR_SYNC_FAILED', 'Ein Termin im Google-Kalender enthält ein unbekanntes Datumsformat.', 422);
    }

    /** @return array<string, mixed> */
    private function rule(string $value, DateTimeZone $fallbackZone): array
    {
        $rule = ['FREQ' => '', 'INTERVAL' => 1, 'COUNT' => null, 'UNTIL' => null, 'BYDAY' => []];
        foreach (explode(';', strtoupper($value)) as $part) {
            [$key, $ruleValue] = array_pad(explode('=', $part, 2), 2, '');
            if ($key === 'INTERVAL' || $key === 'COUNT') { $rule[$key] = max(1, (int) $ruleValue); }
            elseif ($key === 'BYDAY') { $rule[$key] = array_filter(explode(',', $ruleValue)); }
            elseif ($key === 'UNTIL') { $rule[$key] = $this->dateValue(['value' => $ruleValue, 'parameters' => []], $fallbackZone)['date']; }
            else { $rule[$key] = $ruleValue; }
        }
        return $rule;
    }

    /** @param array<string, mixed> $rule @return list<DateTimeImmutable> */
    private function occurrences(DateTimeImmutable $base, array $rule, DateTimeImmutable $windowEnd, DateTimeZone $fallbackZone): array
    {
        $frequency = (string) ($rule['FREQ'] ?? '');
        if (!in_array($frequency, ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], true)) { return [$base]; }
        $interval = max(1, (int) ($rule['INTERVAL'] ?? 1));
        $count = is_int($rule['COUNT']) ? $rule['COUNT'] : null;
        $until = $rule['UNTIL'] instanceof DateTimeImmutable ? $rule['UNTIL'] : $windowEnd;
        $limit = $until < $windowEnd ? $until : $windowEnd;
        $results = [];
        $candidate = $base;
        $iterations = 0;
        while ($candidate < $windowEnd && $candidate <= $limit && ($count === null || count($results) < $count) && $iterations++ < 20_000) {
            if ($frequency !== 'WEEKLY' || $this->matchesWeekly($base, $candidate, $interval, $rule['BYDAY'] ?? [])) {
                $results[] = $candidate;
            }
            $candidate = match ($frequency) {
                'DAILY' => $candidate->add(new DateInterval('P' . $interval . 'D')),
                'WEEKLY' => $candidate->add(new DateInterval(($rule['BYDAY'] ?? []) === [] ? 'P' . $interval . 'W' : 'P1D')),
                'MONTHLY' => $this->monthOccurrence($base, $candidate, $interval, $fallbackZone),
                'YEARLY' => $candidate->add(new DateInterval('P' . $interval . 'Y')),
            };
        }
        return $results;
    }

    /** @param list<string> $byDay */
    private function matchesWeekly(DateTimeImmutable $base, DateTimeImmutable $candidate, int $interval, array $byDay): bool
    {
        $days = $byDay === [] ? [strtoupper($base->format('D'))] : array_map(static fn (string $day): string => substr($day, -2), $byDay);
        $map = ['MO' => 1, 'TU' => 2, 'WE' => 3, 'TH' => 4, 'FR' => 5, 'SA' => 6, 'SU' => 7];
        if (!in_array((int) $candidate->format('N'), array_values(array_intersect_key($map, array_flip($days))), true)) { return false; }
        $baseMonday = $base->modify('monday this week')->setTime(0, 0);
        $candidateMonday = $candidate->modify('monday this week')->setTime(0, 0);
        $weeks = intdiv($candidateMonday->getTimestamp() - $baseMonday->getTimestamp(), 604800);
        return $weeks >= 0 && $weeks % $interval === 0;
    }

    private function monthOccurrence(DateTimeImmutable $base, DateTimeImmutable $candidate, int $interval, DateTimeZone $zone): DateTimeImmutable
    {
        $day = (int) $base->format('d');
        $nextMonth = $candidate->modify('first day of +' . $interval . ' month');
        while ($day > (int) $nextMonth->format('t')) {
            $nextMonth = $nextMonth->modify('first day of +' . $interval . ' month');
        }
        return new DateTimeImmutable($nextMonth->format('Y-m-') . sprintf('%02d', $day) . $base->format(' H:i:s'), $zone);
    }

    /** @param list<array<string, mixed>> $events @param array<string, mixed> $item */
    private function appendOccurrence(array &$events, array $item, DateTimeImmutable $start, DateTimeImmutable $windowStart, DateTimeImmutable $windowEnd): void
    {
        $end = $start->modify('+' . $item['duration'] . ' seconds');
        if ($end <= $windowStart || $start >= $windowEnd) { return; }
        $events[] = [
            'uuid' => $this->uuid($item['uid'] . '|' . $start->format('c')),
            'external_uid' => $item['uid'],
            'title' => $item['title'] === '' ? 'Termin' : $item['title'],
            'description' => $item['description'],
            'location' => $item['location'],
            'starts_at' => $start->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z'),
            'ends_at' => $end->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z'),
            'all_day' => $item['allDay'] ? 1 : 0,
            'is_private' => $item['isPrivate'] ? 1 : 0,
        ];
    }

    private function text(string $value): string
    {
        return str_replace(['\\n', '\\N', '\\,', '\\;', '\\\\'], ["\n", "\n", ',', ';', '\\'], trim($value));
    }

    private function nullableText(string $value, int $maxLength): ?string
    {
        $text = mb_substr($this->text($value), 0, $maxLength);
        return $text === '' ? null : $text;
    }

    private function uuid(string $value): string
    {
        $bytes = substr(hash('sha256', $value, true), 0, 16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x50);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
