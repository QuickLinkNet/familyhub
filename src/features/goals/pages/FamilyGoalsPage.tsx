import { AddRounded, AutoAwesomeRounded, EmojiEventsRounded, FlagRounded } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { FamilyGoalCard } from '../components/FamilyGoalCard';
import { FamilyGoalDialog } from '../components/FamilyGoalDialog';
import { GoalHighlights } from '../components/GoalHighlights';
import { useContributeFamilyGoal, useDeleteFamilyGoal, useFamilyGoals } from '../hooks/useFamilyGoals';
import type { FamilyGoal } from '../types/familyGoal';

export function FamilyGoalsPage() {
  const session = useAuthSession(); const goals = useFamilyGoals(); const contribute = useContributeFamilyGoal(); const remove = useDeleteFamilyGoal();
  const [dialogGoal, setDialogGoal] = useState<FamilyGoal | null | undefined>(undefined);
  const user = session.data?.user; const canManage = user?.role === 'ADMIN' || user?.role === 'PARENT'; const data = goals.data;
  const cutoff = Date.now() - 7 * 86_400_000; const weeklySteps = (data?.activity ?? []).filter(entry => new Date(entry.createdAt).getTime() >= cutoff).reduce((sum, entry) => sum + entry.amount, 0);
  const mutationError = contribute.error ?? remove.error;
  const removeGoal = (goal: FamilyGoal) => { if (window.confirm(`Familienziel „${goal.title}“ wirklich entfernen? Bisherige Beiträge werden ausgeblendet.`)) remove.mutate(goal.id, { onSuccess: () => setDialogGoal(undefined) }); };
  if (goals.isLoading) return <Stack alignItems="center" py={8} gap={2}><CircularProgress /><Typography>Familienziele werden vorbereitet …</Typography></Stack>;
  if (goals.isError || !data || !user) return <Alert severity="error">Die Familienziele konnten nicht geladen werden.</Alert>;
  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <PageHeader title="Gemeinsam schaffen wir das" description="Kleine Schritte werden zu großen Familienmomenten." actions={canManage ? <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialogGoal(null)}>Neues Ziel</Button> : undefined} />
    <Box sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 5, color: 'white', background: 'linear-gradient(125deg, #284b3a 0%, #3f7258 55%, #d6855f 145%)', position: 'relative', overflow: 'hidden' }}>
      <Typography variant="overline" sx={{ opacity: 0.82, letterSpacing: 1.4 }}>Diese Woche</Typography><Typography variant="h3">{weeklySteps} gemeinsame Schritte</Typography><Typography mt={1} sx={{ opacity: 0.85 }}>Jeder Beitrag zählt – und alle sehen, was ihr zusammen bewegt.</Typography><AutoAwesomeRounded sx={{ position: 'absolute', right: 28, top: 28, fontSize: 110, opacity: 0.12 }} />
    </Box>
    {mutationError && <Alert severity="error">{mutationError instanceof ApiError ? mutationError.message : 'Das Familienziel konnte nicht aktualisiert werden.'}</Alert>}
    <Box><Stack direction="row" alignItems="center" gap={1} mb={1.5}><FlagRounded color="primary" /><Typography variant="h5">Aktive Familienziele</Typography></Stack>
      {data.activeGoals.length === 0
        ? <EmptyStateCard icon={<EmojiEventsRounded color="secondary" sx={{ fontSize: 58 }} />} title="Euer nächstes Abenteuer wartet" description="Legt ein gemeinsames Ziel fest und feiert jeden kleinen Schritt auf dem Weg dorthin." action={canManage ? <Button variant="contained" sx={{ mt: 2 }} onClick={() => setDialogGoal(null)}>Erstes Familienziel anlegen</Button> : undefined} />
        : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>{data.activeGoals.map(goal => <FamilyGoalCard key={goal.id} goal={goal} activity={data.activity} canManage={canManage} contributing={contribute.isPending && contribute.variables === goal.id} onContribute={() => contribute.mutate(goal.id)} onEdit={() => setDialogGoal(goal)} />)}</Box>}
    </Box>
    <GoalHighlights completed={data.completedGoals} activity={data.activity.filter(entry => new Date(entry.createdAt).getTime() >= cutoff)} />
    {dialogGoal !== undefined && <FamilyGoalDialog open goal={dialogGoal} onClose={() => setDialogGoal(undefined)} onDelete={removeGoal} />}
  </Stack>;
}
