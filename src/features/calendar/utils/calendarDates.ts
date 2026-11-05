import type { CalendarEvent } from '../types/calendar';

export const dayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
export const monthFormatter = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
export const monthTitleFormatter = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
export const fullDayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
export const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
export const weekdayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
export const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
export const startOfWeek = (date: Date) => addDays(startOfDay(date), -((date.getDay() + 6) % 7));
export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
export const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const localDateTime = (date: Date) => `${localDate(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
export const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isSameDay = (a: Date, b: Date) => localDate(a) === localDate(b);
export const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export function daysBetween(from: Date, to: Date) {
  const days: Date[] = [];
  for (let day = from; day < to; day = addDays(day, 1)) days.push(day);
  return days;
}

export function eventsOnDay(events: CalendarEvent[], day: Date) {
  const dayEnd = addDays(day, 1);
  return events.filter(event => new Date(event.startsAt) < dayEnd && new Date(event.endsAt) > day);
}
