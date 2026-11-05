import { ShoppingBasketRounded } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';

export function ShoppingPage() {
  return (
    <EmptyStateCard
      icon={<ShoppingBasketRounded color="primary" sx={{ fontSize: 56 }} />}
      title="Einkauf ist in Vorbereitung"
      description="Gemeinsame Listen und schnelles Abhaken folgen in einer der nächsten Ausbaustufen."
      action={<Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>Zur Übersicht</Button>}
    />
  );
}
