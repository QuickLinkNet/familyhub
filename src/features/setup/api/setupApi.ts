import { apiGet, apiPost } from '../../../services/apiClient';
import type { InstallationSummary, SetupInput, SetupStatus } from '../types/setup';

export const getSetupStatus = (signal?: AbortSignal) => apiGet<SetupStatus>('/setup/status', signal);
export const installHousehold = (input: SetupInput) => apiPost<InstallationSummary>('/setup', input);
