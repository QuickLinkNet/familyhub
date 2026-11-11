export type HouseholdCategory = 'CLEANING' | 'TRASH' | 'PLANTS' | 'LAUNDRY' | 'PETS' | 'OTHER';
export type HouseholdRecurrence = 'ONCE' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface HouseholdMemberRef { id: string; name: string; color: string }

export interface HouseholdChore {
  id: string;
  title: string;
  description: string | null;
  category: HouseholdCategory;
  recurrence: HouseholdRecurrence;
  nextDueDate: string;
  lastCompletedAt: string | null;
  isActive: boolean;
  assignedMember: HouseholdMemberRef;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdCompletion {
  id: string;
  choreId: string;
  title: string;
  category: HouseholdCategory;
  scheduledDate: string;
  completedAt: string;
  completedBy: HouseholdMemberRef;
}

export interface HouseholdBoard { chores: HouseholdChore[]; completions: HouseholdCompletion[] }

export interface HouseholdChoreInput {
  title: string;
  description: string;
  category: HouseholdCategory;
  assignedMemberId: string;
  recurrence: HouseholdRecurrence;
  nextDueDate: string;
}
