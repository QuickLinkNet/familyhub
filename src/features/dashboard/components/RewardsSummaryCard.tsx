import { CardGiftcardRounded, StarRounded } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';

export function RewardsSummaryCard({ points, loading, error }: { points: number; loading: boolean; error: boolean }) {
  return <DashboardCard title="Schatzkiste" icon={<CardGiftcardRounded color="secondary" />} accent="#D6855F">
    <Stack direction="row" alignItems="center" gap={0.75}><StarRounded sx={{ color: 'warning.main', fontSize: 34 }} /><Typography variant="h3">{loading || error ? '–' : points}</Typography><Typography color="text.secondary">Sterne</Typography></Stack>
    <Typography color="text.secondary" mt={1}>{error ? 'Guthaben konnte nicht geladen werden' : points === 0 ? 'Die ersten Sterne warten schon' : 'Dein persönliches Guthaben'}</Typography>
    <Button component={Link} to="/rewards" sx={{ mt: 1 }}>Schatzkiste öffnen</Button>
  </DashboardCard>;
}
