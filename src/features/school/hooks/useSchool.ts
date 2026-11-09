import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSchoolItem, createSchoolLesson, deleteSchoolItem, deleteSchoolLesson, getSchoolBoard, toggleSchoolItem, updateSchoolItem, updateSchoolLesson } from '../api/schoolApi';
import type { SchoolItemInput, SchoolLessonInput } from '../types/school';

const key = ['school-board'] as const;
export const useSchoolBoard = (from: string, to: string) => useQuery({ queryKey: [...key, from, to], queryFn: ({ signal }) => getSchoolBoard(from, to, signal) });
const schoolMutation = <T,>(fn: (input: T) => Promise<unknown>) => { const client = useQueryClient(); return useMutation({ mutationFn: fn, onSuccess: () => client.invalidateQueries({ queryKey: key }) }); };
export const useCreateSchoolLesson = () => schoolMutation((input: SchoolLessonInput) => createSchoolLesson(input));
export const useUpdateSchoolLesson = () => schoolMutation(({ id, input }: { id: string; input: SchoolLessonInput }) => updateSchoolLesson(id, input));
export const useDeleteSchoolLesson = () => schoolMutation((id: string) => deleteSchoolLesson(id));
export const useCreateSchoolItem = () => schoolMutation((input: SchoolItemInput) => createSchoolItem(input));
export const useUpdateSchoolItem = () => schoolMutation(({ id, input }: { id: string; input: SchoolItemInput }) => updateSchoolItem(id, input));
export const useToggleSchoolItem = () => schoolMutation((id: string) => toggleSchoolItem(id));
export const useDeleteSchoolItem = () => schoolMutation((id: string) => deleteSchoolItem(id));
