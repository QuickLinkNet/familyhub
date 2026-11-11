import { AddTaskRounded, EditRounded, EventRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { FamilyGoal, GoalActivity } from '../types/familyGoal';
import { GoalProgress } from './GoalProgress';

const dateLabel = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' });

export function FamilyGoalCard({ goal, activity, canManage, contributing, onContribute, onEdit }: { goal: FamilyGoal; activity: GoalActivity[]; canManage: boolean; contributing: boolean; onContribute: () => void; onEdit: () => void }) {
  const recentMembers = activity.filter(entry => entry.goalId === goal.id).filter((entry, index, all) => all.findIndex(item => item.member.id === entry.member.id) === index).slice(0, 5);
  return <Card sx={{ height: '100%', borderTop: `6px solid ${goal.color}` }}>
    <CardContent sx={{ p: { xs: 2.25, sm: 2.75 }, '&:last-child': { pb: { xs: 2.25, sm: 2.75 } } }}>
      <Stack spacing={2.25} height="100%">
        <Stack direction="row" alignItems="flex-start" gap={1.5}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 56, height: 56, borderRadius: 4, fontSize: 30, bgcolor: `${goal.color}20` }}>{goal.icon}</Box>
          <Box flex={1}><Typography variant="h5">{goal.title}</Typography>{goal.description && <Typography color="text.secondary" mt={0.5}>{goal.description}</Typography>}</Box>
          {canManage && <IconButton aria-label={`${goal.title} bearbeiten`} onClick={onEdit}><EditRounded /></IconButton>}
        </Stack>
        <GoalProgress current={goal.currentValue} target={goal.targetValue} color={goal.color} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
          <Stack direction="row" alignItems="center">
            {recentMembers.length === 0 ? <Typography variant="body2" color="text.secondary">Der erste Schritt wartet auf euch.</Typography> : recentMembers.map((entry, index) => <MemberAvatar key={entry.member.id} name={entry.member.name} sx={{ width: 34, height: 34, fontSize: 13, bgcolor: entry.member.color, ml: index === 0 ? 0 : -0.75, border: '2px solid white' }} />)}
          </Stack>
          {goal.dueDate && <Chip icon={<EventRounded />} label={`bis ${dateLabel.format(new Date(`${goal.dueDate}T12:00:00`))}`} size="small" variant="outlined" />}
        </Stack>
        <Button startIcon={<AddTaskRounded />} variant="contained" onClick={onContribute} disabled={contributing} sx={{ mt: 'auto', bgcolor: goal.color, '&:hover': { bgcolor: goal.color, filter: 'brightness(.9)' } }}>{contributing ? 'Wird eingetragen …' : 'Einen Schritt geschafft'}</Button>
      </Stack>
    </CardContent>
  </Card>;
}
