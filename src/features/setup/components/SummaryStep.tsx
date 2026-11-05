import { CalendarMonthRounded } from '@mui/icons-material';
import { Alert, Avatar, Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { SetupMemberDraft } from '../types/setupDraft';

interface SummaryStepProps {
  householdName: string;
  timezone: string;
  members: SetupMemberDraft[];
}

export function SummaryStep({ householdName, timezone, members }: SummaryStepProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><CalendarMonthRounded /></Avatar>
        <Box><Typography variant="h5">Bereit für euren Alltag</Typography><Typography color="text.secondary">Diese Grundstruktur wird jetzt einmalig angelegt.</Typography></Box>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        <SummaryCard value={householdName} label={timezone} />
        <SummaryCard value={`${members.length} Personen`} label={members.map(member => member.name).join(', ')} />
        <SummaryCard value={`${members.length + 1} Kalender`} label="1 Familienkalender plus persönliche Kalender" />
      </Box>
      <Alert severity="info">Nach der Einrichtung kann dieser Assistent nicht erneut gestartet werden. Profile und Einstellungen lassen sich später einzeln bearbeiten.</Alert>
    </Stack>
  );
}

function SummaryCard({ value, label }: { value: string; label: string }) {
  return <Card variant="outlined"><CardContent><Typography variant="h6">{value}</Typography><Typography variant="body2" color="text.secondary" mt={0.5}>{label}</Typography></CardContent></Card>;
}
