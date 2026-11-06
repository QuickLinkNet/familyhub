import { Google, LinkOffRounded, RefreshRounded, SettingsRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Divider, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import type { GoogleCalendarConnection, GoogleCalendarSource } from '../types/googleCalendar';

interface GoogleConnectionCardProps {
  connection: GoogleCalendarConnection;
  authorizing: boolean;
  disconnecting: boolean;
  togglingId?: string;
  syncingId?: string;
  onSetup: () => void;
  onAuthorize: () => void;
  onDisconnect: () => void;
  onToggle: (source: GoogleCalendarSource, active: boolean) => void;
  onSync: (source: GoogleCalendarSource) => void;
}

export function GoogleConnectionCard(props: GoogleConnectionCardProps) {
  const { connection, authorizing, disconnecting, togglingId, syncingId, onSetup, onAuthorize, onDisconnect, onToggle, onSync } = props;
  return (
    <Card sx={{ borderLeft: '5px solid', borderLeftColor: connection.connected ? 'success.main' : 'primary.main' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
        <Stack spacing={2.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Google color="primary" fontSize="large" />
              <Box>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="h6">Google direkt verbinden</Typography>
                  <Chip size="small" color={connection.connected ? 'success' : connection.configured ? 'warning' : 'default'} label={connection.connected ? 'Verbunden' : connection.configured ? 'Anmeldung offen' : 'Nicht eingerichtet'} />
                </Stack>
                <Typography color="text.secondary">Termine am Board erstellen, bearbeiten und löschen – Änderungen landen direkt in Google Kalender.</Typography>
              </Box>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              {!connection.configured && <Button variant="contained" startIcon={<SettingsRounded />} onClick={onSetup}>Einrichten</Button>}
              {connection.configured && !connection.connected && <Button variant="contained" onClick={onAuthorize} disabled={authorizing}>{authorizing ? 'Wird geöffnet …' : 'Mit Google anmelden'}</Button>}
              {connection.configured && <Button variant="outlined" startIcon={<SettingsRounded />} onClick={onSetup}>Zugangsdaten</Button>}
              {connection.connected && <Button color="error" startIcon={<LinkOffRounded />} onClick={onDisconnect} disabled={disconnecting}>Trennen</Button>}
            </Stack>
          </Stack>
          {connection.configured && <Typography variant="body2" color="text.secondary">OAuth-Client: {connection.clientIdHint}{connection.accountLabel ? ` · Konto: ${connection.accountLabel}` : ''}</Typography>}
          {connection.connected && connection.calendars.length > 0 && (
            <>
              <Divider />
              <Stack spacing={1.25}>
                <Typography variant="subtitle1" fontWeight={800}>Am Familienboard anzeigen</Typography>
                {connection.calendars.map(source => (
                  <Stack key={source.id} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1} sx={{ p: 1.25, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <FormControlLabel
                      control={<Switch checked={source.isActive} disabled={togglingId === source.id} onChange={event => onToggle(source, event.target.checked)} />}
                      label={<Stack direction="row" alignItems="center" gap={1}><Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: source.color }} /><span>{source.name}</span>{source.isPrimary && <Chip size="small" label="Primär" />}{!source.writable && <Chip size="small" label="Nur lesen" />}</Stack>}
                    />
                    {source.isActive && <Button size="small" startIcon={<RefreshRounded />} disabled={syncingId === source.id} onClick={() => onSync(source)}>{syncingId === source.id ? 'Lädt …' : 'Synchronisieren'}</Button>}
                  </Stack>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
