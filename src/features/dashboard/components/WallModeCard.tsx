import { TvRounded } from '@mui/icons-material';
import { Button, Chip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';

export function WallModeCard() {
  return (
    <DashboardCard title="Familienboard" icon={<TvRounded color="primary" />} accent="#6c8ab8">
      <Chip size="small" color="secondary" label="Wandmodus 2.0" variant="outlined" />
      <Typography color="text.secondary" mt={1.5}>Uhrzeit, Wetter, Familienfotos und alles Wichtige in einer ruhigen Vollbildansicht.</Typography>
      <Button component={Link} to="/wall" sx={{ mt: 1.5 }} variant="text">Wandmodus öffnen</Button>
    </DashboardCard>
  );
}
