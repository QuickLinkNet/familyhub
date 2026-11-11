import { NotificationsActiveRounded, NotificationsNoneRounded, NotificationsOffRounded, NotificationsRounded } from '@mui/icons-material';
import { Alert, Badge, Box, CircularProgress, IconButton, Popover, Stack, Tooltip, Typography } from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { useBrowserNotifications } from '../hooks/useBrowserNotifications';
import { useReminders } from '../hooks/useReminders';
import { BrowserNotificationDialog } from './BrowserNotificationDialog';
import { ReminderList } from './ReminderList';

export function ReminderCenter() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const reminders = useReminders();
  const board = reminders.data;
  const browserNotifications = useBrowserNotifications(board);
  const count = board?.summary.critical ? board.summary.critical + board.summary.attention : board?.summary.total ?? 0;
  const open = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);
  const close = () => setAnchor(null);

  return <>
    <IconButton aria-label={count > 0 ? `${count} Erinnerungen öffnen` : 'Erinnerungen öffnen'} onClick={open}>
      <Badge badgeContent={count} color={board?.summary.critical ? 'error' : 'warning'} max={9}>
        {count > 0 ? <NotificationsRounded /> : <NotificationsNoneRounded />}
      </Badge>
    </IconButton>
    <Popover open={Boolean(anchor)} anchorEl={anchor} onClose={close} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { width: { xs: 'calc(100vw - 24px)', sm: 430 }, maxHeight: 'min(680px, calc(100vh - 90px))', mt: 1, borderRadius: 3 } } }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <div><Typography variant="overline" color="primary.main">Für dich</Typography><Typography variant="h5">{board?.headline ?? 'Deine Erinnerungen'}</Typography></div>
          <Tooltip title="Browser-Benachrichtigungen einstellen"><span><IconButton aria-label="Browser-Benachrichtigungen einstellen" color={browserNotifications.status.enabled ? 'primary' : 'default'} disabled={!board} onClick={() => setSettingsOpen(true)}>{browserNotifications.status.enabled ? <NotificationsActiveRounded /> : <NotificationsOffRounded />}</IconButton></span></Tooltip>
        </Stack>
        {board && <Typography variant="body2" color="text.secondary" mt={0.5}>{board.audience.name}, hier steht nur, was gerade wirklich wichtig ist.</Typography>}
      </Box>
      {reminders.isLoading && <Stack alignItems="center" py={5}><CircularProgress size={30} /></Stack>}
      {reminders.isError && <Alert severity="warning" sx={{ m: 2 }}>Erinnerungen konnten gerade nicht geladen werden.</Alert>}
      {board && board.items.length > 0 && <Box px={1.25} pb={1.25}><ReminderList items={board.items} compact onNavigate={close} /></Box>}
      {board && board.items.length === 0 && <Box px={2.5} pb={3}><Alert severity="success">Genieß den freien Kopf – aktuell ist nichts dringend.</Alert></Box>}
    </Popover>
    <BrowserNotificationDialog open={settingsOpen} status={browserNotifications.status} error={browserNotifications.error} onClose={() => setSettingsOpen(false)} onEnable={() => void browserNotifications.enable()} onDisable={browserNotifications.disable} onTest={() => void browserNotifications.test()} />
  </>;
}
