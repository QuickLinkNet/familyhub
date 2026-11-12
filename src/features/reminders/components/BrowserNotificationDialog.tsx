import { NotificationsActiveRounded, NotificationsOffRounded, SecurityRounded } from '@mui/icons-material';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import type { BrowserNotificationStatus } from '../types/browserNotification';

type Props = {
  open: boolean;
  status: BrowserNotificationStatus;
  error: string | null;
  onClose: () => void;
  onEnable: () => void;
  onDisable: () => void;
  onTest: () => void;
};

export function BrowserNotificationDialog({ open, status, error, onClose, onEnable, onDisable, onTest }: Props) {
  const denied = status.permission === 'denied';
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><NotificationsActiveRounded color="primary" /> Browser-Benachrichtigungen</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} pt={0.5}>
          <Typography color="text.secondary">FamilyHub meldet nur neue kritische oder zeitnahe Hinweise und bündelt Wiederholungen. Die Nachricht erreicht dich auch bei geschlossener App.</Typography>
          <Alert severity={status.enabled ? 'success' : denied ? 'warning' : 'info'} icon={status.enabled ? <NotificationsActiveRounded /> : <NotificationsOffRounded />}>
            {!status.supported && 'Dieser Browser unterstützt keine Systembenachrichtigungen.'}
            {status.supported && denied && 'Benachrichtigungen sind im Browser blockiert. Du kannst sie in den Website-Einstellungen wieder erlauben.'}
            {status.supported && !denied && status.enabled && `Push ist auf diesem Gerät aktiv. Insgesamt sind ${status.deviceCount} Familiengerät${status.deviceCount === 1 ? '' : 'e'} verbunden.`}
            {status.supported && !denied && !status.enabled && 'Benachrichtigungen sind für dieses Familienprofil ausgeschaltet.'}
          </Alert>
          <Stack direction="row" gap={1.25} alignItems="flex-start"><SecurityRounded color="action" /><Typography variant="body2" color="text.secondary">Die Nachricht wird im eigenen FamilyHub erzeugt, für genau diesen Browser verschlüsselt und über dessen Pushdienst zugestellt. FamilyHub verwendet kein zusätzliches Nutzertracking.</Typography></Stack>
          <Typography variant="body2" color="text.secondary">Auf iPhone und iPad muss FamilyHub zuerst zum Home-Bildschirm hinzugefügt werden. Auf Desktop und Android genügt die Browserfreigabe.</Typography>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, flexWrap: 'wrap' }}>
        <Button onClick={onClose}>Schließen</Button>
        {status.enabled && <Button variant="outlined" onClick={onTest}>Test senden</Button>}
        {status.enabled ? <Button color="warning" variant="contained" onClick={onDisable}>Auf diesem Gerät ausschalten</Button> : <Button variant="contained" onClick={onEnable} disabled={!status.supported || denied || status.loading}>Push aktivieren</Button>}
      </DialogActions>
    </Dialog>
  );
}
