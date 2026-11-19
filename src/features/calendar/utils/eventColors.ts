import type { CalendarEvent } from '../types/calendar';

export function eventColors(event: CalendarEvent): string[] {
  return event.members?.length > 0
    ? event.members.map(member => member.color)
    : [event.calendar.color];
}

export function eventColorGradient(event: CalendarEvent, direction = 'to bottom'): string {
  const colors = eventColors(event);
  if (colors.length === 1) return colors[0];
  const width = 100 / colors.length;
  const stops = colors.flatMap((color, index) => [
    `${color} ${index * width}%`,
    `${color} ${(index + 1) * width}%`
  ]);
  return `linear-gradient(${direction}, ${stops.join(', ')})`;
}
