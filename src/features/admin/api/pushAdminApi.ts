import { apiGet, apiPost } from '../../../services/apiClient';
import type { PushAdministration, PushDispatchResult } from '../types/push';

export const getPushAdministration = (signal?: AbortSignal) => apiGet<PushAdministration>('/admin/push', signal);
export const dispatchPushNow = () => apiPost<PushDispatchResult>('/admin/push/dispatch', {});
