import { AddRounded, CleaningServicesRounded, DeleteOutlineRounded, EditRounded, FormatListBulletedRounded } from '@mui/icons-material';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { FamilyListDialog } from '../components/FamilyListDialog';
import { FamilyListItemRow } from '../components/FamilyListItemRow';
import { FamilyListQuickAdd } from '../components/FamilyListQuickAdd';
import { FamilyListSelector } from '../components/FamilyListSelector';
import { visibilityMeta } from '../constants/listOptions';
import { useClearCompletedFamilyListItems, useDeleteFamilyList, useFamilyLists } from '../hooks/useFamilyLists';

export function FamilyListsPage() {
  const query = useFamilyLists(); const remove = useDeleteFamilyList(); const clear = useClearCompletedFamilyListItems(); const theme = useTheme();
  const [selectedId, setSelectedId] = useState(''); const [createOpen, setCreateOpen] = useState(false); const [editOpen, setEditOpen] = useState(false); const [confirmDelete, setConfirmDelete] = useState(false);
  const lists = useMemo(() => query.data ?? [], [query.data]);
  useEffect(() => { if (lists.length > 0 && !lists.some(list => list.id === selectedId)) setSelectedId(lists[0].id); }, [lists, selectedId]);
  const selected = lists.find(list => list.id === selectedId) ?? lists[0];
  if (query.isLoading) return <Stack alignItems="center" py={8} gap={2}><CircularProgress /><Typography>Listen werden geladen …</Typography></Stack>;
  if (query.isError) return <Alert severity="error">Die Listen konnten nicht geladen werden.</Alert>;
  const header = <PageHeader title="Listen" description="Packen, planen und gemeinsam abhaken – für alles, was nicht vergessen werden darf." actions={<Button variant="contained" startIcon={<AddRounded />} onClick={() => setCreateOpen(true)}>Neue Liste</Button>} />;
  if (!selected) return <Stack spacing={3}>{header}<EmptyStateCard icon={<FormatListBulletedRounded color="primary" sx={{ fontSize: 60 }} />} title="Platz für eure erste Liste" description="Erstellt eine Packliste, einen Projektplan oder eine private Merkliste." action={<Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ mt: 2 }}>Erste Liste anlegen</Button>} /><FamilyListDialog open={createOpen} onClose={() => setCreateOpen(false)} /></Stack>;
  const openItems = selected.items.filter(item => !item.isCompleted); const completedItems = selected.items.filter(item => item.isCompleted); const total = selected.items.length; const progress = total === 0 ? 0 : completedItems.length / total * 100; const visibility = visibilityMeta[selected.visibility]; const VisibilityIcon = visibility.icon; const contrast = theme.palette.getContrastText(selected.color);
  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    {header}<FamilyListSelector lists={lists} selectedId={selected.id} onSelect={setSelectedId} />
    <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 4, color: contrast, bgcolor: selected.color }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}><Box><Stack direction="row" alignItems="center" gap={1} flexWrap="wrap"><Typography variant="h4">{selected.icon} {selected.name}</Typography><Chip size="small" icon={<VisibilityIcon />} label={visibility.label} sx={{ color: 'inherit', borderColor: 'currentColor', '& .MuiChip-icon': { color: 'inherit' } }} variant="outlined" /></Stack>{selected.description && <Typography sx={{ opacity: 0.9, mt: 0.5 }}>{selected.description}</Typography>}<Typography sx={{ opacity: 0.85, mt: 0.5 }}>{openItems.length === 0 ? 'Alles erledigt – stark!' : `${openItems.length} ${openItems.length === 1 ? 'Punkt ist' : 'Punkte sind'} noch offen`}</Typography></Box>{selected.canManage && <Stack direction="row"><IconButton aria-label="Liste bearbeiten" onClick={() => setEditOpen(true)} sx={{ color: 'inherit' }}><EditRounded /></IconButton><IconButton aria-label="Liste löschen" onClick={() => setConfirmDelete(true)} sx={{ color: 'inherit' }}><DeleteOutlineRounded /></IconButton></Stack>}</Stack>
      <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, height: 9, borderRadius: 5, bgcolor: 'action.disabledBackground', '& .MuiLinearProgress-bar': { bgcolor: 'currentColor' } }} />
    </Box>
    <FamilyListQuickAdd listId={selected.id} color={selected.color} />
    {openItems.length === 0 ? <Alert severity="success">Aktuell ist alles erledigt. Neue Punkte könnt ihr oben direkt ergänzen.</Alert> : <Stack gap={1}>{openItems.map(item => <FamilyListItemRow key={item.id} item={item} color={selected.color} />)}</Stack>}
    {completedItems.length > 0 && <Box><Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}><Typography variant="h6">Erledigt ({completedItems.length})</Typography><Button startIcon={<CleaningServicesRounded />} onClick={() => clear.mutate(selected.id)} disabled={clear.isPending}>Erledigte entfernen</Button></Stack><Stack gap={1}>{completedItems.map(item => <FamilyListItemRow key={item.id} item={item} color={selected.color} />)}</Stack></Box>}
    <FamilyListDialog open={createOpen} onClose={() => setCreateOpen(false)} /><FamilyListDialog open={editOpen} list={selected} onClose={() => setEditOpen(false)} />
    <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}><DialogTitle>Liste löschen?</DialogTitle><DialogContent><Typography>„{selected.name}“ und alle enthaltenen Punkte werden entfernt.</Typography></DialogContent><DialogActions><Button onClick={() => setConfirmDelete(false)}>Abbrechen</Button><Button color="error" onClick={() => remove.mutate(selected.id, { onSuccess: () => setConfirmDelete(false) })}>Liste löschen</Button></DialogActions></Dialog>
  </Stack>;
}
