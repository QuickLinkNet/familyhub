import { apiGet } from '../../../services/apiClient';

export interface HealthStatus { status: 'ok'; database: 'ok'; version: string; }
export const getHealth = (signal?: AbortSignal) => apiGet<HealthStatus>('/health', signal);
