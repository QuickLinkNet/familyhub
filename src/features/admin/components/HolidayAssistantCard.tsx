import { BeachAccessRounded, EditCalendarRounded, RefreshRounded } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Link, Stack, Typography } from '@mui/material';
import type { HolidayStatus } from '../types/holiday';
import { HolidayPreviewList } from './HolidayPreviewList';

interface Props {
  status?: HolidayStatus;
  loading: boolean;
  error: string | null;
  syncing: boolean;
  onSetup: () => void;
  onSync: () => void;
}

export function HolidayAssistantCard({ status, loading, error, syncing, onSetup, onSync }: Props) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
        <Stack spacing={2.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
            <Stack direction="row" gap={1.5} alignItems="flex-start">
              <BeachAccessRounded color="primary" fontSize="large" />
              <Box>
                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="h6">Ferien & Feiertage</Typography>
                  {status?.configured && <Chip size="small" color="success" label="Aktiv" />}
                </Stack>
                <Typography color="text.secondary">Regionale Kalender automatisch und schreibgeschützt ergänzen.</Typography>
              </Box>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              {status?.configured && <Button variant="outlined" startIcon={<RefreshRounded />} onClick={onSync} disabled={syncing}>{syncing ? 'Aktualisiert …' : 'Jetzt aktualisieren'}</Button>}
              <Button variant="contained" startIcon={<EditCalendarRounded />} onClick={onSetup}>{status?.configured ? 'Einstellungen' : 'Jetzt einrichten'}</Button>
            </Stack>
          </Stack>
          {loading && <Stack alignItems="center" py={2}><CircularProgress size={28} /></Stack>}
          {error && <Alert severity="error">{error}</Alert>}
          {status?.configured && (
            <>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Chip label={status.regionName} />
                {status.publicEnabled && <Chip variant="outlined" label="Gesetzliche Feiertage" />}
                {status.schoolEnabled && <Chip variant="outlined" label="Schulferien" />}
              </Stack>
              <Box>
                <Typography variant="subtitle2" mb={0.5}>Als Nächstes</Typography>
                <HolidayPreviewList events={status.nextEvents} emptyLabel="Im gespeicherten Zeitraum sind keine weiteren Einträge vorhanden." />
              </Box>
            </>
          )}
          {!loading && !status?.configured && !error && <Alert severity="info">Wähle einmal dein Bundesland. FamilyHub hält die Einträge anschließend automatisch aktuell.</Alert>}
          <Typography variant="caption" color="text.secondary">
            Übertragen werden nur Region, Sprache und Zeitraum. Datenquelle:{' '}
            <Link href={status?.attributionUrl ?? 'https://www.openholidaysapi.org/'} target="_blank" rel="noreferrer">OpenHolidays API</Link>.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

