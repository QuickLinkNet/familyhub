import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeRoutineStep, createRoutine, deleteRoutine, getRoutines, updateRoutine } from '../api/routineApi';
import type { RoutineInput } from '../types/routine';

export const routinesKey = ['routines'] as const;
export const useRoutines = () => useQuery({ queryKey: routinesKey, queryFn: ({ signal }) => getRoutines(signal) });

const refresh = (client: ReturnType<typeof useQueryClient>) => client.invalidateQueries({ queryKey: routinesKey });
export const useCreateRoutine = () => { const client = useQueryClient(); return useMutation({ mutationFn: (input: RoutineInput) => createRoutine(input), onSuccess: () => refresh(client) }); };
export const useUpdateRoutine = () => { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: RoutineInput }) => updateRoutine(id, input), onSuccess: () => refresh(client) }); };
export const useDeleteRoutine = () => { const client = useQueryClient(); return useMutation({ mutationFn: (id: string) => deleteRoutine(id), onSuccess: () => refresh(client) }); };
export const useCompleteRoutineStep = () => { const client = useQueryClient(); return useMutation({ mutationFn: ({ runId, stepId }: { runId: string; stepId: string }) => completeRoutineStep(runId, stepId), onSuccess: () => refresh(client) }); };
