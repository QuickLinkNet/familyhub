import { RedeemRounded, StarRounded, TaskAltRounded } from '@mui/icons-material';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography } from '@mui/material';
import type { RewardActivity } from '../types/reward';

const date = (value: string) => new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export function RewardActivityList({ activity }: { activity: RewardActivity[] }) {
  if (activity.length === 0) return <Paper sx={{ p: 3 }}><Typography color="text.secondary">Noch ist das Sternenbuch leer. Verknüpft Sterne mit einer Aufgabe und legt los.</Typography></Paper>;
  return <Paper><List disablePadding>{activity.slice(0, 12).map((entry, index) => {
    const Icon = entry.type === 'REDEEMED' ? RedeemRounded : entry.type === 'EARNED' ? TaskAltRounded : StarRounded;
    return <ListItem key={entry.id} divider={index < Math.min(activity.length, 12) - 1} sx={{ py: 1.5 }}>
      <ListItemAvatar><Avatar sx={{ bgcolor: `${entry.memberColor}22`, color: entry.memberColor }}><Icon /></Avatar></ListItemAvatar>
      <ListItemText primary={`${entry.memberName}: ${entry.reason}`} secondary={date(entry.createdAt)} />
      <Typography fontWeight={800} color={entry.points > 0 ? 'success.main' : 'secondary.dark'}>{entry.points > 0 ? '+' : ''}{entry.points} ★</Typography>
    </ListItem>;
  })}</List></Paper>;
}
