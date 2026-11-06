import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { GoogleCalendarConnection, GoogleCalendarSource, GoogleOAuthConfigInput } from '../types/googleCalendar';

export const getGoogleConnection = (signal?: AbortSignal) => apiGet<GoogleCalendarConnection>('/admin/google-calendar', signal);
export const configureGoogleConnection = (input: GoogleOAuthConfigInput) => apiPut<GoogleCalendarConnection>('/admin/google-calendar/config', input);
export const authorizeGoogleConnection = () => apiPost<{ authorizationUrl: string }>('/admin/google-calendar/authorize', {});
export const updateGoogleCalendarSource = (id: string, isActive: boolean) => apiPut<GoogleCalendarSource>(`/admin/google-calendar/sources/${id}`, { isActive });
export const syncGoogleCalendarSource = (id: string) => apiPost<GoogleCalendarSource>(`/admin/google-calendar/sources/${id}/sync`, {});
export const disconnectGoogleConnection = () => apiDelete<void>('/admin/google-calendar');
