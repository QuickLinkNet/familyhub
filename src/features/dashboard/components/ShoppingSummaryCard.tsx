import { ShoppingCartRounded } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';

export function ShoppingSummaryCard({ openCount, listCount, loading, error }: { openCount: number; listCount: number; loading: boolean; error: boolean }) {
  return <DashboardCard title="Einkauf" icon={<ShoppingCartRounded color="primary" />} accent="#5B7DB1">
    <Stack direction="row" alignItems="baseline" gap={1}><Typography variant="h3">{loading || error ? '–' : openCount}</Typography><Typography color="text.secondary">Artikel offen</Typography></Stack>
    <Typography color="text.secondary" mt={1}>{error ? 'Listen konnten nicht geladen werden' : listCount === 0 ? 'Noch keine Einkaufsliste' : `${listCount} ${listCount === 1 ? 'gemeinsame Liste' : 'gemeinsame Listen'}`}</Typography>
    <Button component={Link} to="/shopping" sx={{ mt: 1 }}>Einkauf öffnen</Button>
  </DashboardCard>;
}
