import { apiDelete, apiGet, apiPost } from '../../../services/apiClient';
import type { BonusInput, CreateRewardInput, RewardDashboard } from '../types/reward';

export const getRewards = (signal?: AbortSignal) => apiGet<RewardDashboard>('/rewards', signal);
export const createReward = (input: CreateRewardInput) => apiPost<RewardDashboard>('/rewards', input);
export const redeemReward = (id: string, memberId?: string) => apiPost<RewardDashboard>(`/rewards/${id}/redeem`, memberId ? { memberId } : {});
export const addBonus = (input: BonusInput) => apiPost<RewardDashboard>('/rewards/bonus', input);
export const deleteReward = (id: string) => apiDelete<void>(`/rewards/${id}`);
