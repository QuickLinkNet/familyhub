import { CheckRounded, EditRounded, RepeatRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import { categoryOption, recurrenceLabel } from '../constants/householdOptions';
import type { HouseholdChore } from '../types/household';
import { dueLabel, localDate } from '../utils/householdDates';
import { HouseholdCategoryIcon } from './HouseholdCategoryIcon';

interface HouseholdChoreCardProps {
  chore: HouseholdChore;
  canComplete: boolean;
  canManage: boolean;
  completing: boolean;
  onComplete: () => void;
  onEdit: () => void;
}

export function HouseholdChoreCard({ chore, canComplete, canManage, completing, onComplete, onEdit }: HouseholdChoreCardProps) {
  const category = categoryOption(chore.category);
  const overdue = chore.nextDueDate < localDate(new Date());
  return <Card variant="outlined" sx={{ borderColor: overdue ? 'error.light' : 'divider', borderLeft: `6px solid ${category.color}` }}>
    <CardContent sx={{ p: { xs: 2, sm: 2.25 }, '&:last-child': { pb: { xs: 2, sm: 2.25 } } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }}>
        <Stack direction="row" gap={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Box aria-hidden="true" sx={{ width: 48, height: 48, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: `${category.color}1A`, color: category.color, flexShrink: 0 }}><HouseholdCategoryIcon category={chore.category} /></Box>
          <Box sx={{ minWidth: 0 }}><Typography variant="h6" noWrap>{chore.title}</Typography>{chore.description && <Typography color="text.secondary" variant="body2" sx={{ mt: 0.25 }}>{chore.description}</Typography>}<Stack direction="row" gap={0.75} flexWrap="wrap" mt={1}><Chip size="small" label={dueLabel(chore.nextDueDate)} color={overdue ? 'error' : chore.nextDueDate === localDate(new Date()) ? 'primary' : 'default'} /><Chip size="small" icon={<RepeatRounded />} label={recurrenceLabel(chore.recurrence)} variant="outlined" /></Stack></Box>
        </Stack>
        <Stack direction="row" gap={1} alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-end' }}>
          <Stack direction="row" gap={1} alignItems="center"><MemberAvatar name={chore.assignedMember.name} sx={{ bgcolor: chore.assignedMember.color, width: 34, height: 34, fontSize: 13 }} /><Typography variant="body2" fontWeight={750}>{chore.assignedMember.name}</Typography></Stack>
          <Stack direction="row" gap={0.5}>{canManage && <IconButton aria-label={`${chore.title} bearbeiten`} onClick={onEdit}><EditRounded /></IconButton>}<Button variant="contained" color="success" startIcon={<CheckRounded />} disabled={!canComplete || completing} onClick={onComplete}>{completing ? 'Moment …' : 'Erledigt'}</Button></Stack>
        </Stack>
      </Stack>
    </CardContent>
  </Card>;
}
