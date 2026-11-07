import { AddRounded, CloseRounded } from '@mui/icons-material';
import { Box, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import { mealMeta, mealTypes } from '../constants/meals';
import { useDeleteMealEntry } from '../hooks/useMeals';
import type { MealPlanEntry, MealType } from '../types/meal';
import { localDate } from '../utils/mealDates';

const dayFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
export function MealDayCard({ date, entries, canManage, onPlan }: { date: Date; entries: MealPlanEntry[]; canManage: boolean; onPlan: (type: MealType) => void }) {
  const remove = useDeleteMealEntry(); const today = localDate(date) === localDate(new Date());
  return <Card component="section" sx={{ borderTop: today ? '5px solid' : '5px solid transparent', borderTopColor: today ? 'secondary.main' : 'transparent', minWidth: 0 }}><CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
    <Typography variant="h6" textTransform="capitalize" mb={1}>{dayFormat.format(date)}{today ? ' · Heute' : ''}</Typography>
    <Stack gap={0.75}>{mealTypes.map(type => { const entry = entries.find(item => item.mealType === type); const meta = mealMeta[type]; return <Box key={type} sx={{ minHeight: 72, p: 1, borderRadius: 2, bgcolor: entry ? 'primary.light' : 'action.hover', display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ fontSize: 23 }}>{meta.icon}</Box><Box sx={{ minWidth: 0, flex: 1 }}><Typography variant="caption" color="text.secondary">{meta.label}</Typography><Typography fontWeight={700} noWrap>{entry?.title ?? 'Noch offen'}</Typography>{entry?.note && <Typography variant="caption" color="text.secondary" noWrap>{entry.note}</Typography>}</Box>
      {canManage && (entry ? <IconButton size="small" aria-label={`${entry.title} entfernen`} onClick={() => remove.mutate(entry.id)}><CloseRounded fontSize="small" /></IconButton> : <IconButton size="small" aria-label={`${meta.label} planen`} onClick={() => onPlan(type)}><AddRounded fontSize="small" /></IconButton>)}
    </Box>; })}</Stack>
  </CardContent></Card>;
}
