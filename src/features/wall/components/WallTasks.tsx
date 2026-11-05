import { ChecklistRounded } from '@mui/icons-material';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { Task } from '../../tasks/types/task';

export function WallTasks({ tasks }: { tasks: Task[] }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
        <Stack direction="row" alignItems="center" gap={1} mb={2.5}><ChecklistRounded color="success" /><Typography variant="h5">Offene Aufgaben</Typography></Stack>
        {tasks.length === 0
          ? <Typography color="text.secondary">Alles erledigt – Zeit für die schönen Dinge.</Typography>
          : <Stack spacing={1.25}>{tasks.slice(0, 6).map(task => (
            <Stack key={task.id} direction="row" alignItems="center" gap={1.25} sx={{ p: 1.25, borderRadius: 3, bgcolor: 'action.hover' }}>
              {task.assignedMember
                ? <MemberAvatar name={task.assignedMember.name ?? '?'} sx={{ width: 38, height: 38, bgcolor: task.assignedMember.color ?? 'primary.main' }} />
                : <MemberAvatar name="Familie" sx={{ width: 38, height: 38, bgcolor: 'primary.main' }} />}
              <Typography fontWeight={700} sx={{ flex: 1 }}>{task.title}</Typography>
              {task.dueDate && <Chip size="small" label={new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }).format(new Date(`${task.dueDate}T12:00:00`))} />}
            </Stack>
          ))}</Stack>}
      </CardContent>
    </Card>
  );
}
