import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeTask, createTask, getTasks } from '../api/taskApi';
import type { CreateTaskInput } from '../types/task';

const queryKey = ['tasks'] as const;
export const useTasks = () => useQuery({ queryKey, queryFn: ({ signal }) => getTasks(signal) });
export const useCreateTask = () => { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateTaskInput) => createTask(input), onSuccess: () => client.invalidateQueries({ queryKey }) }); };
export const useCompleteTask = () => { const client = useQueryClient(); return useMutation({ mutationFn: (id: string) => completeTask(id), onSuccess: () => client.invalidateQueries({ queryKey }) }); };
