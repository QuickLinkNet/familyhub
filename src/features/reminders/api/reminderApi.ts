import { apiGet } from '../../../services/apiClient';
import type { ReminderBoard } from '../types/reminder';

export const getReminders = (signal?: AbortSignal) => apiGet<ReminderBoard>('/reminders', signal);
