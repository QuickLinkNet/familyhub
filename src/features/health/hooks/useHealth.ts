import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../api/healthApi';

export const useHealth = () => useQuery({ queryKey: ['health'], queryFn: ({ signal }) => getHealth(signal), retry: 1, refetchInterval: 60_000 });
