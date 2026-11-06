import type { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';
import type { AuthRole } from '../../auth/types/auth';
import type { Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface TaskSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  tasks: Task[];
  userId: string | null;
  userRole: AuthRole | null;
  canManage: boolean;
}

export function TaskSection({ title, description, icon, tasks, userId, userRole, canManage }: TaskSectionProps) {
  if (tasks.length === 0) return null;
  return (
    <Stack component="section" spacing={1.25}>
      <Stack direction="row" alignItems="center" gap={1}>
        {icon}
        <div>
          <Typography variant="h5">{title}</Typography>
          {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
        </div>
      </Stack>
      {tasks.map(task => <TaskCard key={task.id} task={task} userId={userId} userRole={userRole} canManage={canManage} />)}
    </Stack>
  );
}
