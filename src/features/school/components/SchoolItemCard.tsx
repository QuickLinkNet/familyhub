import { CheckCircleRounded, EditRounded, RadioButtonUncheckedRounded } from '@mui/icons-material';
import { Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { SchoolItem } from '../types/school';
import { shortDate } from '../utils/schoolDates';

export function SchoolItemCard({ item, canManage, onToggle, onEdit }: { item: SchoolItem; canManage: boolean; onToggle: () => void; onEdit: () => void }) {
  const done = item.completedAt !== null; const overdue = !done && item.dueDate < new Date().toISOString().slice(0, 10);
  return <Card variant="outlined" sx={{ opacity: done ? 0.68 : 1, borderColor: overdue ? 'error.main' : 'divider' }}><CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}><Stack direction="row" gap={1.5} alignItems="flex-start">
    <IconButton color={done ? 'success' : 'default'} aria-label={done ? 'Wieder öffnen' : 'Als erledigt markieren'} onClick={onToggle} disabled={!canManage}>{done ? <CheckCircleRounded /> : <RadioButtonUncheckedRounded />}</IconButton>
    <Stack spacing={0.7} sx={{ flex: 1, minWidth: 0 }}><Stack direction="row" gap={1} alignItems="center" flexWrap="wrap"><Chip size="small" color={item.itemType === 'TEST' ? 'secondary' : 'primary'} label={item.itemType === 'TEST' ? '📝 Test' : '📚 Hausaufgabe'} /><Typography fontWeight={800} color="text.secondary">{item.subject}</Typography></Stack><Typography fontWeight={800} sx={{ textDecoration: done ? 'line-through' : 'none' }}>{item.title}</Typography>{item.description && <Typography color="text.secondary" variant="body2">{item.description}</Typography>}<Stack direction="row" gap={1} alignItems="center" flexWrap="wrap"><Chip size="small" color={overdue ? 'error' : 'default'} label={`${overdue ? 'Überfällig · ' : ''}${shortDate(item.dueDate)}`} /><MemberAvatar name={item.member.name} sx={{ width: 24, height: 24, fontSize: 11, bgcolor: item.member.color }} /><Typography variant="caption">{item.member.name}</Typography></Stack></Stack>
    {canManage && <IconButton aria-label="Schuleintrag bearbeiten" onClick={onEdit}><EditRounded /></IconButton>}
  </Stack></CardContent></Card>;
}
