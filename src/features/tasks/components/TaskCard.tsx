import { EventRounded } from '@mui/icons-material';
import { Alert, Box, Card, CardContent, Checkbox, Chip, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import { ApiError } from '../../../services/apiClient';
import type { AuthRole } from '../../auth/types/auth';
import { useCompleteTask } from '../hooks/useTasks';
import type { Task, TaskPriority } from '../types/task';

const priorityLabels: Record<TaskPriority, string> = { LOW: 'Niedrig', MEDIUM: 'Mittel', HIGH: 'Hoch' };
const priorityColors: Record<TaskPriority, 'default' | 'warning' | 'error'> = { LOW: 'default', MEDIUM: 'warning', HIGH: 'error' };
const dateLabel = (date: string) => new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));

interface TaskCardProps {
  task: Task;
  userId: string | null;
  userRole: AuthRole | null;
}

export function TaskCard({ task, userId, userRole }: TaskCardProps) {
  const complete = useCompleteTask();
  const done = task.status !== 'OPEN';
  const allowed = userRole !== 'CHILD' || task.assignedMember?.id === userId;
  const completeTask = () => {
    if (!done && allowed) complete.mutate(task.id);
  };

  return (
    <Card component="article" sx={{ opacity: task.status === 'COMPLETED' ? 0.68 : 1, transition: 'opacity 180ms ease' }}>
      <CardContent sx={{ p: { xs: 1.75, sm: 2 }, '&:last-child': { pb: { xs: 1.75, sm: 2 } } }}>
        <Stack direction="row" gap={{ xs: 1, sm: 1.5 }} alignItems="flex-start">
          <Checkbox checked={done} disabled={done || complete.isPending || !allowed} onChange={completeTask} inputProps={{ 'aria-label': allowed ? `${task.title} als erledigt markieren` : `${task.title} ist einer anderen Person zugeordnet` }} sx={{ mt: 0.25, minWidth: 48, minHeight: 48 }} />
          <Box sx={{ minWidth: 0, flex: 1, py: 0.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
              <Box>
                <Typography variant="h6" sx={{ textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>{task.title}</Typography>
                {task.description && <Typography color="text.secondary" mt={0.25}>{task.description}</Typography>}
              </Box>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                <Chip size="small" label={priorityLabels[task.priority]} color={priorityColors[task.priority]} />
                {task.status === 'PENDING_VERIFICATION' && <Chip size="small" color="warning" label="Bitte bestätigen" />}
              </Stack>
            </Stack>
            <Stack direction="row" gap={1.5} mt={1.5} flexWrap="wrap" color="text.secondary" alignItems="center">
              {task.assignedMember && (
                <Stack direction="row" gap={0.6} alignItems="center">
                  <MemberAvatar name={task.assignedMember.name ?? '?'} sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: task.assignedMember.color ?? 'primary.main' }} />
                  <Typography variant="body2">{task.assignedMember.name}</Typography>
                </Stack>
              )}
              {task.dueDate && <Stack direction="row" gap={0.5} alignItems="center"><EventRounded fontSize="small" /><Typography variant="body2">Fällig {dateLabel(task.dueDate)}</Typography></Stack>}
              {task.requiresVerification && <Typography variant="body2">Eltern-Check</Typography>}
              {!allowed && <Typography variant="body2">Nur von {task.assignedMember?.name ?? 'der zugeordneten Person'} abschließbar</Typography>}
            </Stack>
            {complete.isError && <Alert severity="error" sx={{ mt: 1.5 }}>{complete.error instanceof ApiError ? complete.error.message : 'Die Aufgabe konnte nicht abgeschlossen werden.'}</Alert>}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
