import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';
import type { SchoolBoard, SchoolItemInput, SchoolLessonInput } from '../types/school';

export const getSchoolBoard = (from: string, to: string, signal?: AbortSignal) => apiGet<SchoolBoard>(`/school-board?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, signal);
export const createSchoolLesson = (input: SchoolLessonInput) => apiPost<SchoolBoard>('/school-lessons', input);
export const updateSchoolLesson = (id: string, input: SchoolLessonInput) => apiPut<SchoolBoard>(`/school-lessons/${id}`, input);
export const deleteSchoolLesson = (id: string) => apiDelete<void>(`/school-lessons/${id}`);
export const createSchoolItem = (input: SchoolItemInput) => apiPost<SchoolBoard>('/school-items', input);
export const updateSchoolItem = (id: string, input: SchoolItemInput) => apiPut<SchoolBoard>(`/school-items/${id}`, input);
export const toggleSchoolItem = (id: string) => apiPost<SchoolBoard>(`/school-items/${id}/toggle`, {});
export const deleteSchoolItem = (id: string) => apiDelete<void>(`/school-items/${id}`);
