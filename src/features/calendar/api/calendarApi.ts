import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { CalendarEvent, CalendarEventInput, FamilyCalendar } from '../types/calendar';

export const getCalendars = (signal?: AbortSignal) => apiGet<FamilyCalendar[]>('/calendars', signal);

export const getCalendarEvents = (from: string, to: string, signal?: AbortSignal) => {
  const query = new URLSearchParams({ from, to });
  return apiGet<CalendarEvent[]>(`/calendar-events?${query.toString()}`, signal);
};

export const createCalendarEvent = (input: CalendarEventInput) => apiPost<CalendarEvent>('/calendar-events', input);
export const updateCalendarEvent = (id: string, input: CalendarEventInput) => apiPut<CalendarEvent>(`/calendar-events/${id}`, input);
export const deleteCalendarEvent = (id: string) => apiDelete<void>(`/calendar-events/${id}`);
