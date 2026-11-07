import { AddRounded, CleaningServicesRounded, DeleteOutlineRounded, ShoppingCartRounded } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { categoryMeta, shoppingCategories } from '../constants/categories';
import { ShoppingItemRow } from '../components/ShoppingItemRow';
import { ShoppingListDialog } from '../components/ShoppingListDialog';
import { ShoppingListSelector } from '../components/ShoppingListSelector';
import { ShoppingQuickAdd } from '../components/ShoppingQuickAdd';
import { useClearCheckedItems, useDeleteShoppingList, useShoppingLists } from '../hooks/useShopping';

export function ShoppingPage() {
  const query = useShoppingLists(); const session = useAuthSession(); const clear = useClearCheckedItems(); const removeList = useDeleteShoppingList();
  const [selectedId, setSelectedId] = useState(''); const [dialogOpen, setDialogOpen] = useState(false); const [confirmDelete, setConfirmDelete] = useState(false);
  const lists = useMemo(() => query.data ?? [], [query.data]);
  useEffect(() => { if (lists.length > 0 && !lists.some(list => list.id === selectedId)) setSelectedId(lists[0].id); }, [lists, selectedId]);
  const selected = lists.find(list => list.id === selectedId) ?? lists[0]; const canManage = session.data?.user?.role === 'ADMIN' || session.data?.user?.role === 'PARENT';
  if (query.isLoading) return <Stack alignItems="center" py={8} gap={2}><CircularProgress /><Typography>Einkaufslisten werden geladen …</Typography></Stack>;
  if (query.isError) return <Alert severity="error">Die Einkaufslisten konnten nicht geladen werden.</Alert>;
  const openCreate = () => setDialogOpen(true);
  if (lists.length === 0) return <Stack spacing={3}><PageHeader title="Einkauf" description="Gemeinsam sammeln, im Laden schnell abhaken." actions={canManage ? <Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>Neue Liste</Button> : undefined} /><EmptyStateCard icon={<ShoppingCartRounded color="primary" sx={{ fontSize: 60 }} />} title="Die Einkaufstasche ist noch leer" description={canManage ? 'Legt eure erste gemeinsame Liste an – für den Wocheneinkauf, die Drogerie oder die nächste Feier.' : 'Ein Elternteil kann die erste gemeinsame Einkaufsliste anlegen.'} action={canManage ? <Button variant="contained" onClick={openCreate} sx={{ mt: 2 }}>Erste Liste anlegen</Button> : undefined} /><ShoppingListDialog open={dialogOpen} onClose={() => setDialogOpen(false)} /></Stack>;
  if (!selected) return null;
  const openItems = selected.items.filter(item => !item.isChecked); const checkedItems = selected.items.filter(item => item.isChecked); const total = selected.items.length; const progress = total === 0 ? 0 : checkedItems.length / total * 100;
  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <PageHeader title="Einkauf" description="Gemeinsam sammeln, im Laden schnell abhaken." actions={canManage ? <Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>Neue Liste</Button> : undefined} />
    <ShoppingListSelector lists={lists} selectedId={selected.id} onSelect={setSelectedId} />
    <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 4, color: 'white', background: `linear-gradient(125deg, ${selected.color}, ${selected.color}cc)` }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box><Typography variant="overline" sx={{ opacity: 0.8 }}>Aktive Liste</Typography><Typography variant="h4">{selected.icon} {selected.name}</Typography><Typography sx={{ opacity: 0.85 }}>{openItems.length === 0 ? 'Alles im Wagen – stark!' : `${openItems.length} ${openItems.length === 1 ? 'Artikel fehlt' : 'Artikel fehlen'} noch`}</Typography></Box>{canManage && <IconButton aria-label="Liste löschen" onClick={() => setConfirmDelete(true)} sx={{ color: 'white' }}><DeleteOutlineRounded /></IconButton>}</Stack>
      <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, height: 9, borderRadius: 5, bgcolor: '#ffffff44', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />
    </Box>
    <ShoppingQuickAdd listId={selected.id} color={selected.color} />
    {openItems.length === 0 ? <Alert severity="success">Aktuell fehlt nichts. Neue Wünsche könnt ihr oben direkt ergänzen.</Alert> : shoppingCategories.map(category => {
      const items = openItems.filter(item => item.category === category); if (items.length === 0) return null; const meta = categoryMeta[category];
      return <Box key={category}><Typography variant="h6" mb={1}>{meta.icon} {meta.label}</Typography><Stack gap={1}>{items.map(item => <ShoppingItemRow key={item.id} item={item} color={selected.color} />)}</Stack></Box>;
    })}
    {checkedItems.length > 0 && <Box><Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}><Typography variant="h6">Im Wagen ({checkedItems.length})</Typography>{canManage && <Button startIcon={<CleaningServicesRounded />} onClick={() => clear.mutate(selected.id)} disabled={clear.isPending}>Erledigte entfernen</Button>}</Stack><Stack gap={1}>{checkedItems.map(item => <ShoppingItemRow key={item.id} item={item} color={selected.color} />)}</Stack></Box>}
    <ShoppingListDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}><DialogTitle>Liste löschen?</DialogTitle><DialogContent><Typography>„{selected.name}“ und alle enthaltenen Artikel werden entfernt.</Typography></DialogContent><DialogActions><Button onClick={() => setConfirmDelete(false)}>Abbrechen</Button><Button color="error" onClick={() => removeList.mutate(selected.id, { onSuccess: () => setConfirmDelete(false) })}>Liste löschen</Button></DialogActions></Dialog>
  </Stack>;
}
