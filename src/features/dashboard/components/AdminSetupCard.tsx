import { AddLinkRounded } from '@mui/icons-material';
import { Button, Chip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';

export function AdminSetupCard() {
  return (
    <DashboardCard title="Google Kalender" icon={<AddLinkRounded color="secondary" />} accent="#d6855f">
      <Chip size="small" color="secondary" label="Nur für Admins" variant="outlined" />
      <Typography color="text.secondary" mt={1.5}>Kathrins Google-Kalender sicher per iCal-Link verbinden und synchronisieren.</Typography>
      <Button component={Link} to="/admin" sx={{ mt: 1.5 }} variant="text">Verbindung einrichten</Button>
    </DashboardCard>
  );
}
