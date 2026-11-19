import { DeleteOutlineRounded, EditRounded, PersonRounded } from '@mui/icons-material';
import { Box, Checkbox, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useDeleteFamilyListItem, useToggleFamilyListItem } from '../hooks/useFamilyLists';
import type { FamilyListItem } from '../types/familyList';
import { FamilyListItemDialog } from './FamilyListItemDialog';

export function FamilyListItemRow({ item, color }: { item: FamilyListItem; color: string }) {
  const toggle = useToggleFamilyListItem(); const remove = useDeleteFamilyListItem(); const [editing, setEditing] = useState(false);
  return <><Paper component="article" variant="outlined" sx={{ p: 1.25, opacity: item.isCompleted ? 0.64 : 1 }}>
    <Stack direction="row" alignItems="center" gap={1}>
      <Checkbox checked={item.isCompleted} onChange={() => toggle.mutate(item.id)} disabled={toggle.isPending} inputProps={{ 'aria-label': `${item.title} ${item.isCompleted ? 'wieder öffnen' : 'abhaken'}` }} sx={{ minWidth: 48, minHeight: 48, color, '&.Mui-checked': { color } }} />
      <Box sx={{ minWidth: 0, flex: 1 }}><Stack direction="row" gap={0.75} alignItems="center" flexWrap="wrap"><Typography fontWeight={750} sx={{ textDecoration: item.isCompleted ? 'line-through' : 'none' }}>{item.title}</Typography>{item.assignedTo && <Chip size="small" icon={<PersonRounded />} label={item.assignedTo.name} sx={{ borderColor: item.assignedTo.color }} variant="outlined" />}</Stack>{item.note && <Typography variant="body2" color="text.secondary">{item.note}</Typography>}{item.isCompleted && item.completedBy && <Typography variant="caption" color="text.secondary">Erledigt von {item.completedBy.name}</Typography>}</Box>
      {!item.isCompleted && <IconButton aria-label={`${item.title} bearbeiten`} onClick={() => setEditing(true)}><EditRounded /></IconButton>}
      <IconButton aria-label={`${item.title} entfernen`} color="error" onClick={() => remove.mutate(item.id)} disabled={remove.isPending}><DeleteOutlineRounded /></IconButton>
    </Stack>
  </Paper><FamilyListItemDialog item={editing ? item : null} onClose={() => setEditing(false)} /></>;
}
