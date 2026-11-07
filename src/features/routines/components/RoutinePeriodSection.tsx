import type { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';
import type { AuthRole } from '../../auth/types/auth';
import { TaskCard } from '../../tasks/components/TaskCard';
import type { Task } from '../../tasks/types/task';
import type { RoutineRun } from '../types/routine';
import { RoutineRunCard } from './RoutineRunCard';

interface RoutinePeriodSectionProps {
  title: string;
  description: string;
  icon: ReactNode;
  runs: RoutineRun[];
  legacyTasks: Task[];
  userId: string | null;
  userRole: AuthRole | null;
  canManage: boolean;
}

export function RoutinePeriodSection(props: RoutinePeriodSectionProps) {
  const { title, description, icon, runs, legacyTasks, userId, userRole, canManage } = props;
  if (runs.length === 0 && legacyTasks.length === 0) return null;
  return (
    <Stack component="section" spacing={1.25}>
      <Stack direction="row" alignItems="center" gap={1}>
        {icon}
        <div><Typography variant="h5">{title}</Typography><Typography variant="body2" color="text.secondary">{description}</Typography></div>
      </Stack>
      {runs.map(run => <RoutineRunCard key={run.id} run={run} userId={userId} userRole={userRole} />)}
      {legacyTasks.map(task => <TaskCard key={task.id} task={task} userId={userId} userRole={userRole} canManage={canManage} />)}
    </Stack>
  );
}
