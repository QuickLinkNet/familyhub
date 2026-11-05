import { DeleteOutlineRounded, EditRounded, Google, SyncRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import type { CalendarSource } from '../types/calendarSource';

interface CalendarSourceCardProps {
  source: CalendarSource;
  syncing: boolean;
  deleting: boolean;
  onEdit: () => void;
  onSync: () => void;
  onDelete: () => void;
}

const dateLabel = (value: string | null) => value === null
  ? 'Noch nicht synchronisiert'
  : new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export function CalendarSourceCard({ source, syncing, deleting, onEdit, onSync, onDelete }: CalendarSourceCardProps) {
  const status = source.lastSyncStatus === 'SUCCESS' ? 'success' : source.lastSyncStatus === 'ERROR' ? 'error' : 'default';
  const statusLabel = source.lastSyncStatus === 'SUCCESS' ? 'Synchronisiert' : source.lastSyncStatus === 'ERROR' ? 'Fehler' : 'Neu';
  return (
    <Card component="article" sx={{ borderLeft: `6px solid ${source.color}` }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Google color="action" />
              <Typography variant="h6">{source.name}</Typography>
              <Chip size="small" color={status} label={statusLabel} />
              {!source.isActive && <Chip size="small" label="Pausiert" variant="outlined" />}
            </Stack>
            <Typography color="text.secondary" mt={1}>{source.urlHint}</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Letzte Aktualisierung: {dateLabel(source.lastSyncedAt)}</Typography>
            {source.lastSyncMessage && <Typography variant="body2" color={source.lastSyncStatus === 'ERROR' ? 'error.main' : 'text.secondary'} mt={0.5}>{source.lastSyncMessage}</Typography>}
          </Box>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Button variant="outlined" startIcon={<SyncRounded />} onClick={onSync} disabled={syncing || deleting}>{syncing ? 'Synchronisiert …' : 'Jetzt synchronisieren'}</Button>
            <IconButton aria-label={`${source.name} bearbeiten`} onClick={onEdit} disabled={syncing || deleting}><EditRounded /></IconButton>
            <IconButton aria-label={`${source.name} entfernen`} color="error" onClick={onDelete} disabled={syncing || deleting}><DeleteOutlineRounded /></IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
