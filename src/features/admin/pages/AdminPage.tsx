import { useState } from 'react';
import { AddLinkRounded, AdminPanelSettingsRounded, TvRounded } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { CalendarSourceCard } from '../components/CalendarSourceCard';
import { CalendarSourceDialog } from '../components/CalendarSourceDialog';
import { useCalendarSources, useCreateCalendarSource, useDeleteCalendarSource, useSyncCalendarSource, useUpdateCalendarSource } from '../hooks/useCalendarSources';
import type { CalendarSource, CalendarSourceInput } from '../types/calendarSource';

export function AdminPage() {
  const session = useAuthSession();
  const isAdmin = session.data?.user?.role === 'ADMIN';
  const sources = useCalendarSources(isAdmin);
  const createSource = useCreateCalendarSource();
  const updateSource = useUpdateCalendarSource();
  const syncSource = useSyncCalendarSource();
  const deleteSource = useDeleteCalendarSource();
  const [dialogSource, setDialogSource] = useState<CalendarSource | null | undefined>(undefined);
  const mutationError = createSource.error ?? updateSource.error;
  const actionError = syncSource.error ?? deleteSource.error;

  if (!isAdmin) {
    return <Alert severity="warning">Dieser Bereich ist ausschließlich für Administratoren freigeschaltet.</Alert>;
  }

  const save = async (input: CalendarSourceInput) => {
    if (dialogSource) await updateSource.mutateAsync({ id: dialogSource.id, input });
    else await createSource.mutateAsync(input);
    setDialogSource(undefined);
  };
  const remove = (source: CalendarSource) => {
    if (window.confirm(`Google-Kalender „${source.name}“ wirklich entfernen? Die Google-Daten selbst bleiben unverändert.`)) {
      deleteSource.mutate(source.id);
    }
  };
  const openCreate = () => {
    createSource.reset();
    updateSource.reset();
    setDialogSource(null);
  };
  const openEdit = (source: CalendarSource) => {
    createSource.reset();
    updateSource.reset();
    setDialogSource(source);
  };

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <PageHeader title="Administration" description="Verbindungen und Präsentationsoptionen für euren Familienkompass." actions={<Button variant="contained" startIcon={<AddLinkRounded />} onClick={openCreate}>Google-Kalender verbinden</Button>} />
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={2}>
            <Stack direction="row" gap={1.5} alignItems="center">
              <TvRounded color="primary" fontSize="large" />
              <div><Typography variant="h6">Präsentations- und Wandmodus</Typography><Typography color="text.secondary">Ruhige Vollbildansicht für Touchdisplay, Tablet oder Fernseher.</Typography></div>
            </Stack>
            <Button component={Link} to="/wall" variant="outlined">Wandmodus öffnen</Button>
          </Stack>
        </CardContent>
      </Card>
      <Stack direction="row" alignItems="center" gap={1}><AdminPanelSettingsRounded color="primary" /><Typography variant="h5">Kalenderquellen</Typography></Stack>
      {actionError && <Alert severity="error">{actionError instanceof ApiError ? actionError.message : 'Die Kalenderaktion ist fehlgeschlagen.'}</Alert>}
      {sources.isLoading && <Stack alignItems="center" py={4}><CircularProgress /></Stack>}
      {sources.isError && <Alert severity="error">{sources.error instanceof ApiError ? sources.error.message : 'Die Kalenderquellen konnten nicht geladen werden.'}</Alert>}
      {!sources.isLoading && !sources.isError && sources.data?.length === 0 && (
        <EmptyStateCard icon={<AddLinkRounded color="primary" sx={{ fontSize: 56 }} />} title="Noch kein Google-Kalender verbunden" description="Füge die geheime iCal-Adresse eines Familienkalenders hinzu. Termine erscheinen danach nur lesbar im Familienkalender und Wandmodus." action={<Button variant="contained" sx={{ mt: 2 }} onClick={openCreate}>Erste Verbindung einrichten</Button>} />
      )}
      <Stack spacing={1.5}>
        {sources.data?.map(source => <CalendarSourceCard key={source.id} source={source} syncing={syncSource.isPending && syncSource.variables === source.id} deleting={deleteSource.isPending && deleteSource.variables === source.id} onEdit={() => openEdit(source)} onSync={() => syncSource.mutate(source.id)} onDelete={() => remove(source)} />)}
      </Stack>
      {dialogSource !== undefined && (
        <CalendarSourceDialog
          source={dialogSource}
          pending={createSource.isPending || updateSource.isPending}
          error={mutationError instanceof ApiError ? mutationError.message : mutationError ? 'Die Kalenderquelle konnte nicht gespeichert werden.' : null}
          onClose={() => { createSource.reset(); updateSource.reset(); setDialogSource(undefined); }}
          onSave={save}
        />
      )}
    </Stack>
  );
}
