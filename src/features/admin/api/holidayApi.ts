import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { HolidayPreview, HolidaySettingsInput, HolidayStatus } from '../types/holiday';

export const getHolidayStatus = (signal?: AbortSignal) => apiGet<HolidayStatus>('/admin/holidays', signal);
export const previewHolidays = (input: HolidaySettingsInput) => apiPost<HolidayPreview>('/admin/holidays/preview', input);
export const configureHolidays = (input: HolidaySettingsInput) => apiPut<HolidayStatus>('/admin/holidays', input);
export const syncHolidays = () => apiPost<HolidayStatus>('/admin/holidays/sync', {});
export const removeHolidays = () => apiDelete<void>('/admin/holidays');

