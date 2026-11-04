export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'OPEN' | 'PENDING_VERIFICATION' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assignedMember: { id: string; name: string | null; color: string | null } | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  requiresVerification: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  assignedMemberId?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  requiresVerification: boolean;
}
