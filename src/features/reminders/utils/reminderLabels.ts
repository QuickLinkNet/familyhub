import type { ReminderItem, ReminderUrgency } from '../types/reminder';

export const urgencyColors: Record<ReminderUrgency, { main: string; soft: string }> = {
  CRITICAL: { main: '#C85C5C', soft: '#FBEAEA' },
  ATTENTION: { main: '#CB8B33', soft: '#FFF4DF' },
  INFO: { main: '#5B7DB1', soft: '#EAF1FB' }
};

const sameDay = (left: Date, right: Date) => left.toDateString() === right.toDateString();

export function reminderTimeLabel(item: ReminderItem, now = new Date()): string {
  const due = new Date(item.dueAt);
  if (Number.isNaN(due.getTime())) return '';
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const time = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(due);
  if (item.type === 'EVENT' || item.type === 'ROUTINE') {
    if (sameDay(due, now)) return `Heute, ${time}`;
    if (sameDay(due, tomorrow)) return `Morgen, ${time}`;
  }
  if (sameDay(due, now)) return 'Heute';
  if (sameDay(due, tomorrow)) return 'Morgen';
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(due);
}
