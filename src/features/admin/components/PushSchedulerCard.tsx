import { ContentCopyRounded, NotificationsActiveRounded, PlayArrowRounded, ScheduleRounded } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { ApiError } from '../../../services/apiClient';
import { useDispatchPush, usePushAdministration } from '../hooks/usePushAdministration';
import type { PushAdministration } from '../types/push';

const previewData: PushAdministration = {
  active: 2,
  lastSuccessAt: new Date().toISOString(),
  lastErrorAt: null,
  schedulerUrl: 'https://familyhub.example/api/v1/push/dispatch?token=••••••••',
  lastDispatchAt: new Date().toISOString(),
  recommendedIntervalMinutes: 5
};

export function PushSchedulerCard({ enabled, preview = false }: { enabled: boolean; preview?: boolean }) {
  const query = usePushAdministration(enabled && !preview);
  const dispatch = useDispatchPush();
  const [copied, setCopied] = useState(false);
  const data = preview ? previewData : query.data;
  const copy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.schedulerUrl);
    setCopied(true); window.setTimeout(() => setCopied(false), 2_000);
  };
  const error = query.error ?? dispatch.error;

  return (
    <Card sx={{ borderLeft: '5px solid', borderLeftColor: 'secondary.main' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
        <Stack spacing={2.25}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={2}>
            <Stack direction="row" gap={1.5} alignItems="flex-start">
              <NotificationsActiveRounded color="secondary" fontSize="large" />
              <div><Typography variant="h6">Echte Push-Erinnerungen</Typography><Typography color="text.secondary">Verschlüsselte Hinweise erreichen verbundene Familiengeräte auch bei geschlossener App.</Typography></div>
            </Stack>
            {data && <Stack direction="row" gap={1} flexWrap="wrap"><Chip color={data.active > 0 ? 'success' : 'default'} label={`${data.active} Geräte aktiv`} /><Button variant="outlined" startIcon={<PlayArrowRounded />} disabled={dispatch.isPending} onClick={() => dispatch.mutate()}>{dispatch.isPending ? 'Prüft …' : 'Jetzt prüfen'}</Button></Stack>}
          </Stack>
          {query.isLoading && !preview && <Stack alignItems="center"><CircularProgress size={28} /></Stack>}
          {error && <Alert severity="error">{error instanceof ApiError ? error.message : 'Die Push-Einrichtung konnte nicht geladen werden.'}</Alert>}
          {dispatch.data && <Alert severity={dispatch.data.failed > 0 ? 'warning' : 'success'}>{dispatch.data.delivered} Nachricht(en) zugestellt, {dispatch.data.failed} fehlgeschlagen.</Alert>}
          {data && <>
            <Stack direction="row" alignItems="center" gap={1}><ScheduleRounded color="action" /><Typography variant="subtitle2">Scheduler einmalig im Hosting eintragen: alle {data.recommendedIntervalMinutes} Minuten diese URL aufrufen.</Typography></Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField fullWidth label="Geheime Scheduler-URL" value={data.schedulerUrl} slotProps={{ input: { readOnly: true } }} />
              <Button variant="contained" startIcon={<ContentCopyRounded />} onClick={() => void copy()}>{copied ? 'Kopiert' : 'Kopieren'}</Button>
            </Stack>
            <Alert severity="info">Behandle die Scheduler-URL wie ein Passwort. Sie startet ausschließlich die Erinnerungsprüfung und gibt keine Familiendaten zurück.</Alert>
          </>}
        </Stack>
      </CardContent>
    </Card>
  );
}
