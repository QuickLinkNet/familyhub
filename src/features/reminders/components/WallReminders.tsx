import { NotificationsActiveRounded } from '@mui/icons-material';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReminderBoard } from '../types/reminder';
import { ReminderList } from './ReminderList';

export function WallReminders({ board }: { board?: ReminderBoard }) {
  if (!board || board.items.length === 0) return null;
  return <Card component="section" aria-label="Heute wichtig" sx={{ borderLeft: '6px solid', borderColor: board.summary.critical > 0 ? 'error.main' : 'warning.main' }}>
    <CardContent sx={{ p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
      <Stack direction="row" gap={1.25} alignItems="center" mb={1}><NotificationsActiveRounded color={board.summary.critical > 0 ? 'error' : 'warning'} /><Typography variant="h5">Heute wichtig</Typography></Stack>
      <ReminderList items={board.items} limit={4} compact />
    </CardContent>
  </Card>;
}
