import { apiGet, apiPost } from '../../../services/apiClient';
import type { CreateTaskInput, Task } from '../types/task';

export const getTasks = (signal?: AbortSignal) => apiGet<Task[]>('/tasks', signal);
export const createTask = (input: CreateTaskInput) => apiPost<Task>('/tasks', input);
export const completeTask = (id: string) => apiPost<Task>(`/tasks/${id}/complete`, {});
