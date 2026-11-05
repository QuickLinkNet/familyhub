import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { CalendarSource, CalendarSourceInput } from '../types/calendarSource';

export const getCalendarSources = (signal?: AbortSignal) => apiGet<CalendarSource[]>('/admin/calendar-sources', signal);
export const createCalendarSource = (input: CalendarSourceInput) => apiPost<CalendarSource>('/admin/calendar-sources', input);
export const updateCalendarSource = (id: string, input: CalendarSourceInput) => apiPut<CalendarSource>(`/admin/calendar-sources/${id}`, input);
export const syncCalendarSource = (id: string) => apiPost<CalendarSource>(`/admin/calendar-sources/${id}/sync`, {});
export const deleteCalendarSource = (id: string) => apiDelete<void>(`/admin/calendar-sources/${id}`);
