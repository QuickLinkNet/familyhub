import { DevicesRounded, LogoutRounded, SmartphoneRounded } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import { ApiError } from '../../../services/apiClient';
import { useAuthDevices, useRevokeAuthDevice } from '../hooks/useCompanion';
import { ContextHelpLink } from '../../../components/atoms/ContextHelpLink';

const formatDateTime = (value: string) => new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export function DeviceManagerCard({ enabled }: { enabled: boolean }) {
  const devices = useAuthDevices(enabled);
  const revoke = useRevokeAuthDevice();
  const active = devices.data?.filter(device => device.revokedAt === null) ?? [];

  const remove = (id: string, label: string) => {
    if (window.confirm(`„${label}“ wirklich von FamilyHub abmelden?`)) revoke.mutate(id);
  };

  return <Card>
    <CardContent>
      <Stack spacing={2.25}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Stack direction="row" gap={1.25} alignItems="center"><DevicesRounded color="primary" /><Stack><Stack direction="row" gap={1} alignItems="center" flexWrap="wrap"><Typography variant="h6">Verbundene Geräte</Typography><ContextHelpLink topic="mobile" /></Stack><Typography variant="body2" color="text.secondary">Aktive Handys, Tablets und Browser zentral verwalten.</Typography></Stack></Stack>
          <Chip label={`${active.length} aktiv`} color={active.length > 0 ? 'success' : 'default'} />
        </Stack>
        {devices.isLoading && <Stack alignItems="center"><CircularProgress size={28} /></Stack>}
        {devices.isError && <Alert severity="error">{devices.error instanceof ApiError ? devices.error.message : 'Die Geräteliste konnte nicht geladen werden.'}</Alert>}
        {revoke.error && <Alert severity="error">{revoke.error instanceof ApiError ? revoke.error.message : 'Das Gerät konnte nicht abgemeldet werden.'}</Alert>}
        {!devices.isLoading && active.length === 0 && <Alert severity="info">Noch keine registrierten Geräte. Bestehende Sitzungen erscheinen nach ihrer nächsten Verwendung automatisch.</Alert>}
        <Stack divider={<Divider flexItem />}>
          {active.map(device => <Stack key={device.id} direction={{ xs: 'column', sm: 'row' }} gap={1.5} py={1.25} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Stack direction="row" gap={1.25} alignItems="center" flex={1} minWidth={0}>
              <MemberAvatar name={device.profile.name} sx={{ bgcolor: device.profile.color }} />
              <Stack minWidth={0}>
                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap"><Typography fontWeight={700}>{device.label}</Typography>{device.current && <Chip size="small" label="Dieses Gerät" />}</Stack>
                <Typography variant="body2" color="text.secondary" noWrap><SmartphoneRounded sx={{ fontSize: '1em', verticalAlign: 'middle', mr: 0.5 }} />{device.profile.name} · zuletzt {formatDateTime(device.lastSeenAt)}</Typography>
              </Stack>
            </Stack>
            <Button color="warning" startIcon={<LogoutRounded />} disabled={device.current || revoke.isPending} onClick={() => remove(device.id, device.label)}>Abmelden</Button>
          </Stack>)}
        </Stack>
      </Stack>
    </CardContent>
  </Card>;
}
