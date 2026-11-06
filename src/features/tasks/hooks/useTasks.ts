import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeTask, createTask, getTasks, verifyTask } from '../api/taskApi';
import type { CreateTaskInput } from '../types/task';

const queryKey = ['tasks'] as const;
export const useTasks = () => useQuery({ queryKey, queryFn: ({ signal }) => getTasks(signal) });
export const useCreateTask = () => { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateTaskInput) => createTask(input), onSuccess: () => client.invalidateQueries({ queryKey }) }); };
const refreshTasksAndRewards = (client: ReturnType<typeof useQueryClient>) => {
  void client.invalidateQueries({ queryKey });
  void client.invalidateQueries({ queryKey: ['rewards'] });
};
export const useCompleteTask = () => { const client = useQueryClient(); return useMutation({ mutationFn: (id: string) => completeTask(id), onSuccess: () => refreshTasksAndRewards(client) }); };
export const useVerifyTask = () => { const client = useQueryClient(); return useMutation({ mutationFn: (id: string) => verifyTask(id), onSuccess: () => refreshTasksAndRewards(client) }); };
