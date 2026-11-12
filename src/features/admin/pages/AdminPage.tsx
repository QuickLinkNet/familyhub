import { useState } from 'react';
import { AddLinkRounded, AdminPanelSettingsRounded } from '@mui/icons-material';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { CalendarSourceCard } from '../components/CalendarSourceCard';
import { BackupManagerCard } from '../components/BackupManagerCard';
import { CalendarSourceDialog } from '../components/CalendarSourceDialog';
import { GoogleConnectionCard } from '../components/GoogleConnectionCard';
import { GoogleSetupDialog } from '../components/GoogleSetupDialog';
import { PortableArchiveCard } from '../components/PortableArchiveCard';
import { PushSchedulerCard } from '../components/PushSchedulerCard';
import { WallPresentationCard } from '../components/WallPresentationCard';
import { useCalendarSources, useCreateCalendarSource, useDeleteCalendarSource, useSyncCalendarSource, useUpdateCalendarSource } from '../hooks/useCalendarSources';
import { useAuthorizeGoogle, useConfigureGoogle, useDisconnectGoogle, useGoogleConnection, useSyncGoogleCalendar, useToggleGoogleCalendar, useVerifyGoogle } from '../hooks/useGoogleCalendar';
import type { CalendarSource, CalendarSourceInput } from '../types/calendarSource';
import type { GoogleOAuthConfigInput } from '../types/googleCalendar';

export function AdminPage() {
  const session = useAuthSession();
  const [searchParams] = useSearchParams();
  const isAdmin = session.data?.user?.role === 'ADMIN';
  const sources = useCalendarSources(isAdmin);
  const createSource = useCreateCalendarSource();
  const updateSource = useUpdateCalendarSource();
  const syncSource = useSyncCalendarSource();
  const deleteSource = useDeleteCalendarSource();
  const google = useGoogleConnection(isAdmin);
  const configureGoogle = useConfigureGoogle();
  const authorizeGoogle = useAuthorizeGoogle();
  const toggleGoogle = useToggleGoogleCalendar();
  const syncGoogle = useSyncGoogleCalendar();
  const disconnectGoogle = useDisconnectGoogle();
  const verifyGoogle = useVerifyGoogle();
  const [dialogSource, setDialogSource] = useState<CalendarSource | null | undefined>(undefined);
  const [googleSetupOpen, setGoogleSetupOpen] = useState(false);
  const mutationError = createSource.error ?? updateSource.error;
  const actionError = syncSource.error ?? deleteSource.error;
  const googleError = configureGoogle.error ?? authorizeGoogle.error ?? toggleGoogle.error ?? syncGoogle.error ?? disconnectGoogle.error ?? verifyGoogle.error;

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
  const saveGoogle = async (input: GoogleOAuthConfigInput) => {
    await configureGoogle.mutateAsync(input);
    setGoogleSetupOpen(false);
  };
  const authorize = async () => {
    try {
      const result = await authorizeGoogle.mutateAsync();
      window.location.assign(result.authorizationUrl);
    } catch { /* Mutation state renders the safe API error. */ }
  };
  const disconnect = () => {
    if (window.confirm('Google-Verbindung wirklich trennen? Die Termine in Google bleiben unverändert.')) disconnectGoogle.mutate();
  };

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <PageHeader title="Administration" description="Verbindungen und Präsentationsoptionen für euren Familienkompass." actions={<Button variant="contained" startIcon={<AddLinkRounded />} onClick={openCreate}>iCal-Link hinzufügen</Button>} />
      {searchParams.get('google') === 'connected' && <Alert severity="success">Google Kalender ist verbunden. Der primäre Kalender wurde automatisch aktiviert.</Alert>}
      {searchParams.get('google') === 'error' && <Alert severity="error">Die Google-Anmeldung konnte nicht abgeschlossen werden. Bitte starte sie erneut.</Alert>}
      <WallPresentationCard enabled={isAdmin} />
      <PushSchedulerCard enabled={isAdmin} preview={import.meta.env.DEV && searchParams.get('push') === 'preview'} />
      <PortableArchiveCard preview={import.meta.env.DEV && searchParams.get('archive') === 'preview'} />
      <BackupManagerCard enabled={isAdmin} />
      <Stack direction="row" alignItems="center" gap={1}><AdminPanelSettingsRounded color="primary" /><Typography variant="h5">Direkte Google-Verbindung</Typography></Stack>
      {googleError && <Alert severity="error">{googleError instanceof ApiError ? googleError.message : 'Die Google-Verbindung konnte nicht aktualisiert werden.'}</Alert>}
      {google.isLoading && <Stack alignItems="center" py={3}><CircularProgress /></Stack>}
      {google.isError && <Alert severity="error">{google.error instanceof ApiError ? google.error.message : 'Der Google-Status konnte nicht geladen werden.'}</Alert>}
      {google.data && (
        <GoogleConnectionCard
          connection={google.data}
          authorizing={authorizeGoogle.isPending}
          disconnecting={disconnectGoogle.isPending}
          togglingId={toggleGoogle.isPending ? toggleGoogle.variables?.id : undefined}
          syncingId={syncGoogle.isPending ? syncGoogle.variables : undefined}
          verifying={verifyGoogle.isPending}
          verification={verifyGoogle.data}
          onSetup={() => { configureGoogle.reset(); setGoogleSetupOpen(true); }}
          onAuthorize={() => { authorizeGoogle.reset(); void authorize(); }}
          onDisconnect={disconnect}
          onToggle={(source, isActive) => toggleGoogle.mutate({ id: source.id, isActive })}
          onSync={source => syncGoogle.mutate(source.id)}
          onVerify={() => verifyGoogle.mutate()}
        />
      )}
      <Stack direction="row" alignItems="center" gap={1}><AddLinkRounded color="primary" /><Typography variant="h5">iCal-Kalender · nur lesen</Typography></Stack>
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
      {googleSetupOpen && google.data && (
        <GoogleSetupDialog
          callbackUrl={google.data.callbackUrl}
          pending={configureGoogle.isPending}
          error={configureGoogle.error instanceof ApiError ? configureGoogle.error.message : configureGoogle.error ? 'Die OAuth-Zugangsdaten konnten nicht gespeichert werden.' : null}
          onClose={() => { configureGoogle.reset(); setGoogleSetupOpen(false); }}
          onSave={saveGoogle}
        />
      )}
    </Stack>
  );
}
