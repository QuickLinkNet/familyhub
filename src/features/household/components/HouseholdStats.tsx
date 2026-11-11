import { CheckCircleRounded, EventAvailableRounded, WarningAmberRounded } from '@mui/icons-material';
import { Paper, Stack, Typography } from '@mui/material';

const stat = (label: string, value: number, icon: React.ReactNode, color: string) => <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 150 }}><Stack direction="row" gap={1.25} alignItems="center"><span style={{ color }}>{icon}</span><span><Typography variant="h4">{value}</Typography><Typography variant="body2" color="text.secondary">{label}</Typography></span></Stack></Paper>;

export function HouseholdStats({ due, upcoming, completed }: { due: number; upcoming: number; completed: number }) {
  return <Stack direction="row" gap={1.5} flexWrap="wrap">{stat('heute oder überfällig', due, <WarningAmberRounded />, '#C85C5C')}{stat('danach geplant', upcoming, <EventAvailableRounded />, '#5B7DB1')}{stat('zuletzt geschafft', completed, <CheckCircleRounded />, '#4F8A62')}</Stack>;
}
