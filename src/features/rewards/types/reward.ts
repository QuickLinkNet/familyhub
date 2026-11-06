import type { AuthRole } from '../../auth/types/auth';

export interface RewardBalance {
  member: { id: string; name: string; color: string; role: AuthRole; avatarUrl: string | null };
  points: number;
}
export interface Reward {
  id: string; title: string; description: string | null; costPoints: number; icon: string; color: string; createdAt: string; updatedAt: string;
}
export type RewardActivityType = 'EARNED' | 'REDEEMED' | 'BONUS';
export interface RewardActivity {
  id: string; memberId: string; memberName: string; memberColor: string; type: RewardActivityType; points: number; reason: string; taskTitle: string | null; rewardTitle: string | null; createdAt: string;
}
export interface RewardDashboard { balances: RewardBalance[]; rewards: Reward[]; activity: RewardActivity[]; }
export interface CreateRewardInput { title: string; description: string; costPoints: number; icon: string; color: string; }
export interface BonusInput { memberId: string; points: number; reason: string; }
