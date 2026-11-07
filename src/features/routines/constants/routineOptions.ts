import type { RoutinePeriod } from '../../tasks/types/task';

export const routinePeriodLabels: Record<RoutinePeriod, string> = {
  MORNING: 'Morgen', AFTERNOON: 'Nachmittag', EVENING: 'Abend'
};

const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const repeatDaysLabel = (days: number[]) => days.length === 7
  ? 'Täglich'
  : days.join(',') === '1,2,3,4,5'
    ? 'Werktags'
    : days.map(day => dayNames[day - 1]).join(' · ');
