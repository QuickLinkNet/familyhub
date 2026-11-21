import type { CalendarEvent } from '../types/calendar';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('de-DE');
}

export function eventMatchesSearch(event: CalendarEvent, query: string) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const searchable = normalize([
    event.title,
    event.location,
    event.description,
    event.calendar.name,
    ...(event.members ?? []).map(member => member.name)
  ].filter((value): value is string => Boolean(value)).join(' '));

  return terms.every(term => searchable.includes(term));
}
