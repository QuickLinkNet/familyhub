import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { RoutineInput, RoutineOverview, RoutineRun } from '../types/routine';

export const getRoutines = (signal?: AbortSignal) => apiGet<RoutineOverview>('/routines', signal);
export const createRoutine = (input: RoutineInput) => apiPost<RoutineOverview>('/routines', input);
export const updateRoutine = (id: string, input: RoutineInput) => apiPut<RoutineOverview>(`/routines/${id}`, input);
export const deleteRoutine = (id: string) => apiDelete<void>(`/routines/${id}`);
export const completeRoutineStep = (runId: string, stepId: string) => apiPost<RoutineRun>(`/routine-runs/${runId}/steps/${stepId}/complete`, {});
