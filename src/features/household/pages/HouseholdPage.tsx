import { AddRounded, HomeWorkRounded } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { HouseholdChoreCard } from '../components/HouseholdChoreCard';
import { HouseholdChoreDialog } from '../components/HouseholdChoreDialog';
import { HouseholdCompletionList } from '../components/HouseholdCompletionList';
import { HouseholdStats } from '../components/HouseholdStats';
import { useCompleteHouseholdChore, useDeleteHouseholdChore, useHouseholdBoard } from '../hooks/useHousehold';
import type { HouseholdChore } from '../types/household';
import { addDays, localDate } from '../utils/householdDates';

export function HouseholdPage() {
  const board = useHouseholdBoard(); const family = useFamilyMembers(); const session = useAuthSession(); const complete = useCompleteHouseholdChore(); const remove = useDeleteHouseholdChore();
  const [dialogOpen, setDialogOpen] = useState(false); const [editing, setEditing] = useState<HouseholdChore | null>(null); const [deleting, setDeleting] = useState<HouseholdChore | null>(null);
  const members = useMemo(() => (family.data ?? []).filter(member => member.isActive), [family.data]);
  const user = session.data?.user; const adult = user?.role === 'ADMIN' || user?.role === 'PARENT'; const today = localDate(new Date()); const weekEnd = localDate(addDays(new Date(), 7));
  const chores = board.data?.chores ?? []; const due = chores.filter(chore => chore.nextDueDate <= today); const upcoming = chores.filter(chore => chore.nextDueDate > today && chore.nextDueDate <= weekEnd); const later = chores.filter(chore => chore.nextDueDate > weekEnd);
  const closeDialog = () => { setDialogOpen(false); setEditing(null); };
  const openEdit = (chore: HouseholdChore | null = null) => { setEditing(chore); setDialogOpen(true); };
  const canComplete = (chore: HouseholdChore) => Boolean(adult || chore.assignedMember.id === user?.id);
  if (board.isLoading || family.isLoading) return <Stack alignItems="center" py={8} gap={2}><CircularProgress /><Typography>Der Haushalt wird sortiert …</Typography></Stack>;
  if (board.isError || family.isError || !board.data) return <Alert severity="error">Der Haushaltsplan konnte nicht geladen werden.</Alert>;
  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <PageHeader title="Haushalt läuft" description="Jeder weiß, was dran ist – ohne Erinnerungschaos und Zurufen." actions={adult ? <Button variant="contained" startIcon={<AddRounded />} onClick={() => openEdit()}>Aufgabe planen</Button> : undefined} />
    <HouseholdStats due={due.length} upcoming={upcoming.length + later.length} completed={board.data.completions.length} />
    {complete.isError && <Alert severity="error">{complete.error instanceof ApiError ? complete.error.message : 'Die Aufgabe konnte nicht abgehakt werden.'}</Alert>}
    {chores.length === 0 ? <EmptyStateCard icon={<HomeWorkRounded />} title="Der Haushaltsplan ist noch leer" description="Plant wiederkehrende Handgriffe einmal und verteilt sie fair auf die Familie." action={adult ? <Button variant="contained" onClick={() => openEdit()}>Erste Aufgabe anlegen</Button> : undefined} /> : <Stack spacing={3}>
      <ChoreSection title="Heute dran" empty="Für heute ist alles geschafft." chores={due} render={chore => <HouseholdChoreCard key={chore.id} chore={chore} canComplete={canComplete(chore)} canManage={adult} completing={complete.isPending && complete.variables === chore.id} onComplete={() => complete.mutate(chore.id)} onEdit={() => openEdit(chore)} />} />
      <ChoreSection title="Als Nächstes" chores={upcoming} render={chore => <HouseholdChoreCard key={chore.id} chore={chore} canComplete={canComplete(chore)} canManage={adult} completing={complete.isPending && complete.variables === chore.id} onComplete={() => complete.mutate(chore.id)} onEdit={() => openEdit(chore)} />} />
      {later.length > 0 && <ChoreSection title="Später geplant" chores={later} render={chore => <HouseholdChoreCard key={chore.id} chore={chore} canComplete={canComplete(chore)} canManage={adult} completing={complete.isPending && complete.variables === chore.id} onComplete={() => complete.mutate(chore.id)} onEdit={() => openEdit(chore)} />} />}
    </Stack>}
    <HouseholdCompletionList completions={board.data.completions} />
    <HouseholdChoreDialog open={dialogOpen} chore={editing} members={members} defaultMemberId={editing?.assignedMember.id ?? user?.id ?? members[0]?.id ?? ''} onClose={closeDialog} onDelete={chore => { closeDialog(); setDeleting(chore); }} />
    <Dialog open={deleting !== null} onClose={() => setDeleting(null)}><DialogTitle>Aufgabe löschen?</DialogTitle><DialogContent><Typography>„{deleting?.title}“ wird aus dem Haushaltsplan entfernt. Bereits erledigte Einträge bleiben in der Historie.</Typography></DialogContent><DialogActions><Button onClick={() => setDeleting(null)}>Abbrechen</Button><Button color="error" disabled={remove.isPending} onClick={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}>Löschen</Button></DialogActions></Dialog>
  </Stack>;
}

function ChoreSection({ title, empty, chores, render }: { title: string; empty?: string; chores: HouseholdChore[]; render: (chore: HouseholdChore) => React.ReactNode }) {
  return <Box component="section"><Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={1.5}><Typography variant="h5">{title}</Typography><Typography color="text.secondary">{chores.length}</Typography></Stack>{chores.length === 0 ? <Alert severity="success">{empty ?? 'Hier ist gerade nichts geplant.'}</Alert> : <Stack spacing={1.5}>{chores.map(render)}</Stack>}</Box>;
}
