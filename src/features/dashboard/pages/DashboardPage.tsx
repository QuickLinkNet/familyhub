import { CalendarMonthRounded, CheckCircleRounded, CloudQueueRounded, GroupRounded, RestaurantRounded, ShoppingBasketRounded } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { DashboardCard } from '../../../components/molecules/DashboardCard';

const today = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

export function DashboardPage() {
  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <Box><Typography variant="h3" sx={{ fontSize: { xs: '2.15rem', md: '3.1rem' }, textTransform: 'capitalize' }}>Guten Morgen</Typography><Typography color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '1rem', md: '1.125rem' } }}>{today} · Alles Wichtige für eure Familie.</Typography></Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 2, md: 2.5 }, alignItems: 'stretch' }}>
      <DashboardCard title="Heute" icon={<CalendarMonthRounded color="primary" />} accent="#345b48"><Typography variant="h5">2 Termine</Typography><Typography color="text.secondary" mt={0.5}>15:30 · Klavierunterricht</Typography><Typography color="text.secondary">18:00 · Familienessen</Typography><Button sx={{ mt: 2 }} variant="text">Kalender öffnen</Button></DashboardCard>
      <DashboardCard title="Aufgaben" icon={<CheckCircleRounded color="success" />} accent="#4f8a62"><Stack direction="row" alignItems="baseline" spacing={1}><Typography variant="h3">5</Typography><Typography color="text.secondary">offen</Typography></Stack><LinearProgress aria-label="3 von 8 Aufgaben erledigt" variant="determinate" value={37.5} color="success" sx={{ height: 10, borderRadius: 10, mt: 1.5 }} /><Typography color="text.secondary" mt={1}>3 von 8 heute erledigt</Typography><Button sx={{ mt: 1 }} variant="text">Aufgaben ansehen</Button></DashboardCard>
      <DashboardCard title="Familie" icon={<GroupRounded color="secondary" />} accent="#d6855f"><Stack direction="row" spacing={1} mb={1.5}><Avatar sx={{ bgcolor: '#d6855f' }}>M</Avatar><Avatar sx={{ bgcolor: '#6c8ab8' }}>L</Avatar><Avatar sx={{ bgcolor: '#8a7060' }}>P</Avatar><Avatar sx={{ bgcolor: '#4f8a62' }}>S</Avatar></Stack><Typography variant="h6">4 von 4 zu Hause</Typography><Typography color="text.secondary" mt={0.5}>Ein ruhiger Nachmittag steht an.</Typography></DashboardCard>
      <DashboardCard title="Einkauf" icon={<ShoppingBasketRounded color="secondary" />} accent="#e0ad45"><Typography variant="h5">6 Artikel</Typography><Typography color="text.secondary" mt={0.5}>Milch, Brot, Äpfel und 3 weitere</Typography><Button sx={{ mt: 2 }} variant="text">Liste öffnen</Button></DashboardCard>
      <DashboardCard title="Essen" icon={<RestaurantRounded color="secondary" />} accent="#bd7558"><Chip label="Abendessen" size="small" color="secondary" variant="outlined" /><Typography variant="h5" mt={1.5}>Gemüse-Pasta</Typography><Typography color="text.secondary" mt={0.5}>Schnell, bunt und familienfreundlich.</Typography></DashboardCard>
      <DashboardCard title="Wetter" icon={<CloudQueueRounded color="primary" />} accent="#6c8ab8"><Stack direction="row" alignItems="end" spacing={1}><Typography variant="h3">18°</Typography><Typography color="text.secondary" pb={0.75}>leicht bewölkt</Typography></Stack><Typography color="text.secondary" mt={1}>Später trocken bei bis zu 20°.</Typography></DashboardCard>
    </Box>
  </Stack>;
}
