import { AutoAwesomeRounded, NotificationsActiveRounded } from '@mui/icons-material';
import { Alert, Box, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import type { ReminderBoard } from '../types/reminder';
import { ReminderList } from './ReminderList';

interface ReminderOverviewProps { board?: ReminderBoard; loading: boolean; error: boolean }

export function ReminderOverview({ board, loading, error }: ReminderOverviewProps) {
  return <Card component="section" aria-label="Heute wichtig" sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'rgba(52,91,72,0.16)', background: 'linear-gradient(120deg, rgba(52,91,72,0.08), rgba(214,133,95,0.09) 70%, rgba(255,255,255,0.82))' }}>
    <CardContent sx={{ p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={{ xs: 2, md: 3 }} alignItems={{ md: 'stretch' }}>
        <Box sx={{ minWidth: { md: 250 }, maxWidth: { md: 330 } }}>
          <Stack direction="row" alignItems="center" gap={1}><NotificationsActiveRounded color="primary" /><Typography variant="overline" color="primary.main">Heute wichtig</Typography></Stack>
          <Typography variant="h4" mt={0.5}>{board?.headline ?? 'Dein Familienradar'}</Typography>
          <Typography color="text.secondary" mt={1}>{board ? `Persönlich für ${board.audience.name} zusammengestellt.` : 'Termine, Aufgaben, Schule und Routinen auf einen Blick.'}</Typography>
          {board?.summary.total === 0 && <Stack direction="row" gap={1} alignItems="center" mt={2}><AutoAwesomeRounded color="success" /><Typography fontWeight={800}>Zeit für die schönen Dinge.</Typography></Stack>}
        </Box>
        <Box sx={{ flex: 1, bgcolor: 'background.paper', borderRadius: 3, minHeight: 100, boxShadow: '0 10px 30px rgba(32,49,41,0.07)' }}>
          {loading && <Stack alignItems="center" justifyContent="center" minHeight={150}><CircularProgress size={32} /></Stack>}
          {error && <Alert severity="warning" sx={{ m: 2 }}>Das Familienradar ist gerade nicht erreichbar.</Alert>}
          {board && board.items.length > 0 && <ReminderList items={board.items} limit={4} />}
          {board && board.items.length === 0 && <Stack alignItems="center" justifyContent="center" textAlign="center" minHeight={150} p={3}><Typography variant="h6">Alles im grünen Bereich</Typography><Typography color="text.secondary">Keine überfälligen oder zeitnahen Punkte.</Typography></Stack>}
        </Box>
      </Stack>
    </CardContent>
  </Card>;
}
