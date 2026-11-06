import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addBonus, createReward, deleteReward, getRewards, redeemReward } from '../api/rewardApi';
import type { BonusInput, CreateRewardInput } from '../types/reward';

export const rewardsQueryKey = ['rewards'] as const;
export const useRewards = () => useQuery({ queryKey: rewardsQueryKey, queryFn: ({ signal }) => getRewards(signal) });
const dashboardMutation = <T,>(mutationFn: (input: T) => Promise<unknown>) => {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: rewardsQueryKey }) });
};
export const useCreateReward = () => dashboardMutation((input: CreateRewardInput) => createReward(input));
export const useAddBonus = () => dashboardMutation((input: BonusInput) => addBonus(input));
export const useRedeemReward = () => dashboardMutation((input: { id: string; memberId?: string }) => redeemReward(input.id, input.memberId));
export const useDeleteReward = () => dashboardMutation((id: string) => deleteReward(id));
