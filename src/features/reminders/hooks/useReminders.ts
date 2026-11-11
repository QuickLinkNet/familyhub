import { useQuery } from '@tanstack/react-query';
import { getReminders } from '../api/reminderApi';

export const remindersKey = ['reminders'] as const;

export const useReminders = () => useQuery({
  queryKey: remindersKey,
  queryFn: ({ signal }) => getReminders(signal),
  staleTime: 45_000,
  refetchInterval: 60_000
});
