import { ArrowBackRounded, SearchOffRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Card sx={{ maxWidth: 720, mx: 'auto' }}>
      <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
        <SearchOffRounded color="primary" sx={{ fontSize: 64 }} />
        <Typography variant="h3" sx={{ mt: 2, fontSize: { xs: '2.15rem', sm: '3rem' } }}>
          Seite nicht gefunden
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>
          Diese Adresse gehört nicht zum Familienkompass oder ist nicht mehr verfügbar.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button component={Link} to="/" variant="contained" startIcon={<ArrowBackRounded />}>
            Zur Übersicht
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
