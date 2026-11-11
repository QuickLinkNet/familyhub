export interface FamilyGoal {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  targetValue: number;
  currentValue: number;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalActivity {
  id: string;
  goalId: string;
  goalTitle: string;
  goalIcon: string;
  amount: number;
  note: string | null;
  createdAt: string;
  member: { id: string; name: string; color: string };
}

export interface FamilyGoalBoard {
  activeGoals: FamilyGoal[];
  completedGoals: FamilyGoal[];
  activity: GoalActivity[];
}

export interface FamilyGoalInput {
  title: string;
  description: string;
  icon: string;
  color: string;
  targetValue: number;
  dueDate: string;
}
