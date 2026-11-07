import { RestaurantMenuRounded } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';
import type { MealPlanEntry } from '../../meals/types/meal';

export function MealsSummaryCard({ entries, loading, error }: { entries: MealPlanEntry[]; loading: boolean; error: boolean }) {
  return <DashboardCard title="Heute essen wir" icon={<RestaurantMenuRounded color="secondary" />} accent="#CB8B33">
    {loading || error ? <Typography variant="h3">–</Typography> : entries.length === 0 ? <Typography variant="h5">Noch nichts geplant</Typography> : <Stack gap={0.5}>{entries.map(entry => <Typography key={entry.id} fontWeight={700}>{entry.title}</Typography>)}</Stack>}
    <Typography color="text.secondary" mt={1}>{error ? 'Wochenplan konnte nicht geladen werden' : entries.length === 0 ? 'Ein kurzer Plan spart die tägliche Frage' : `${entries.length} ${entries.length === 1 ? 'Mahlzeit' : 'Mahlzeiten'} für heute`}</Typography>
    <Button component={Link} to="/meals" sx={{ mt: 1 }}>Wochenplan öffnen</Button>
  </DashboardCard>;
}
