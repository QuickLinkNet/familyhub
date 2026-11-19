import { useState } from 'react';
import { AddToHomeScreenRounded, CheckCircleRounded, NotificationsActiveRounded, OpenInBrowserRounded } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useBrowserNotifications } from '../../reminders/hooks/useBrowserNotifications';
import { useReminders } from '../../reminders/hooks/useReminders';
import { usePwaInstallation } from '../../wall/hooks/usePwaInstallation';

export function MobileSetupSuccess() {
  const navigate = useNavigate();
  const pwa = usePwaInstallation();
  const reminders = useReminders();
  const notifications = useBrowserNotifications(reminders.data);
  const [installMessage, setInstallMessage] = useState<string | null>(null);

  const install = async () => {
    if (!pwa.canInstall) { setInstallMessage(pwa.hint); return; }
    const accepted = await pwa.install();
    setInstallMessage(accepted ? 'FamilyHub wurde als App hinzugefügt.' : pwa.hint);
  };

  return <Card>
    <CardContent sx={{ p: { xs: 2.5, sm: 4 }, '&:last-child': { pb: { xs: 2.5, sm: 4 } } }}>
      <Stack spacing={2.5}>
        <Alert severity="success" icon={<CheckCircleRounded />}>Dieses Gerät ist sicher mit FamilyHub verbunden.</Alert>
        <Stack spacing={1}>
          <Typography variant="h5">Noch zwei kurze Schritte</Typography>
          <Typography color="text.secondary">Installiere FamilyHub wie eine App und aktiviere auf Wunsch verschlüsselte Familienerinnerungen.</Typography>
        </Stack>
        <Button variant={pwa.installed ? 'outlined' : 'contained'} startIcon={<AddToHomeScreenRounded />} onClick={() => void install()} disabled={pwa.installed}>
          {pwa.installed ? 'Bereits als App installiert' : 'FamilyHub als App installieren'}
        </Button>
        {installMessage && <Alert severity={pwa.installed ? 'success' : 'info'}>{installMessage}</Alert>}
        <Button variant="outlined" startIcon={<NotificationsActiveRounded />} disabled={!notifications.status.supported || notifications.status.loading || notifications.status.enabled} onClick={() => void notifications.enable()}>
          {notifications.status.enabled ? 'Benachrichtigungen sind aktiv' : 'Benachrichtigungen aktivieren und testen'}
        </Button>
        {notifications.error && <Alert severity="error">{notifications.error}</Alert>}
        <Button size="large" startIcon={<OpenInBrowserRounded />} onClick={() => navigate('/', { replace: true })}>FamilyHub öffnen</Button>
      </Stack>
    </CardContent>
  </Card>;
}
