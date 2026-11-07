import type { RoutinePeriod } from '../../tasks/types/task';

export interface RoutineStep {
  id: string;
  title: string;
  position: number;
}

export interface RoutineTemplate {
  id: string;
  title: string;
  description: string | null;
  assignedMember: { id: string; name: string; color: string };
  routinePeriod: RoutinePeriod;
  repeatDays: number[];
  isActive: boolean;
  steps: RoutineStep[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutineRunStep extends RoutineStep {
  status: 'OPEN' | 'COMPLETED';
  completedAt: string | null;
}

export interface RoutineRun {
  id: string;
  templateId: string;
  title: string;
  description: string | null;
  assignedMember: { id: string; name: string; color: string };
  routinePeriod: RoutinePeriod;
  dueDate: string;
  status: 'OPEN' | 'COMPLETED';
  steps: RoutineRunStep[];
  progress: { completed: number; total: number };
  completedAt: string | null;
}

export interface RoutineOverview {
  date: string;
  runs: RoutineRun[];
  templates: RoutineTemplate[];
}

export interface RoutineInput {
  title: string;
  description?: string | null;
  assignedMemberId: string;
  routinePeriod: RoutinePeriod;
  repeatDays: number[];
  steps: string[];
  isActive?: boolean;
}
