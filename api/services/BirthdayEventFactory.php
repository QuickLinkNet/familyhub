<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use DateTimeImmutable;
use DateTimeZone;
use FamilyCompass\Models\FamilyMember;

final class BirthdayEventFactory
{
    /** @param list<FamilyMember> $members @return list<array<string, mixed>> */
    public function between(array $members, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $events = [];
        for ($year = (int) $from->format('Y') - 1; $year <= (int) $to->format('Y'); $year++) {
            foreach ($members as $member) {
                if (!$member->isActive || $member->birthDate === null) {
                    continue;
                }
                [, $month, $day] = array_map('intval', explode('-', $member->birthDate));
                if ($month === 2 && $day === 29 && !checkdate($month, $day, $year)) {
                    $day = 28;
                }
                $start = new DateTimeImmutable(sprintf('%04d-%02d-%02dT00:00:00Z', $year, $month, $day));
                $end = $start->modify('+1 day');
                if ($start >= $to || $end <= $from) {
                    continue;
                }
                $events[] = $this->event($member, $year, $start, $end);
            }
        }
        return $events;
    }

    /** @return array<string, mixed> */
    private function event(FamilyMember $member, int $year, DateTimeImmutable $start, DateTimeImmutable $end): array
    {
        $age = $year - (int) substr((string) $member->birthDate, 0, 4);
        return [
            'id' => 'birthday:' . $member->uuid . ':' . $year,
            'seriesId' => null,
            'calendar' => ['id' => 'birthdays', 'name' => 'Geburtstage', 'color' => $member->color],
            'title' => '🎂 ' . $member->name . ' hat Geburtstag',
            'description' => $age > 0 ? $member->name . ' wird ' . $age . ' Jahre alt.' : null,
            'location' => null,
            'startsAt' => $this->utc($start),
            'endsAt' => $this->utc($end),
            'allDay' => true,
            'recurrence' => ['frequency' => 'YEARLY', 'interval' => 1, 'until' => null],
            'createdBy' => null,
            'source' => 'BIRTHDAY',
            'editable' => false,
            'createdAt' => $member->createdAt,
            'updatedAt' => $member->updatedAt,
        ];
    }

    private function utc(DateTimeImmutable $date): string
    {
        return $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
    }
}
