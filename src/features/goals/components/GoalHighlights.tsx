import { EmojiEventsRounded } from '@mui/icons-material';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { FamilyGoal, GoalActivity } from '../types/familyGoal';

const dateTime = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export function GoalHighlights({ completed, activity }: { completed: FamilyGoal[]; activity: GoalActivity[] }) {
  return <Card><CardContent sx={{ p: { xs: 2.25, md: 3 }, '&:last-child': { pb: { xs: 2.25, md: 3 } } }}>
    <Stack direction="row" gap={1} alignItems="center" mb={2}><EmojiEventsRounded color="secondary" /><Typography variant="h5">Unsere Wochenhighlights</Typography></Stack>
    {activity.length === 0 && completed.length === 0
      ? <Typography color="text.secondary">Eure nächsten gemeinsamen Schritte werden hier sichtbar.</Typography>
      : <Stack spacing={1.25}>
        {completed.slice(0, 3).map(goal => <Stack key={goal.id} direction="row" alignItems="center" gap={1.25} sx={{ p: 1.5, borderRadius: 3, bgcolor: `${goal.color}14` }}><Typography fontSize={28}>{goal.icon}</Typography><Typography fontWeight={800} flex={1}>{goal.title} geschafft!</Typography><Chip label="Gemeinsam erreicht" size="small" sx={{ bgcolor: goal.color, color: 'white' }} /></Stack>)}
        {activity.slice(0, completed.length > 0 ? 4 : 7).map(entry => <Stack key={entry.id} direction="row" alignItems="center" gap={1.25} sx={{ py: 0.75 }}><MemberAvatar name={entry.member.name} sx={{ width: 36, height: 36, fontSize: 13, bgcolor: entry.member.color }} /><div><Typography><strong>{entry.member.name.split(' ')[0]}</strong> bringt {entry.goalIcon} {entry.goalTitle} um {entry.amount} Schritt{entry.amount > 1 ? 'e' : ''} voran.</Typography><Typography variant="caption" color="text.secondary">{dateTime.format(new Date(entry.createdAt))}</Typography></div></Stack>)}
      </Stack>}
  </CardContent></Card>;
}
