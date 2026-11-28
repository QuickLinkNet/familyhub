import { useEffect } from 'react';
import { Alert, Box, Stack, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { HelpTopicCard } from '../components/HelpTopicCard';
import { helpTopics } from '../data/helpTopics';

export function HelpPage() {
  const location = useLocation();
  const session = useAuthSession();
  const isAdmin = session.data?.user?.role === 'ADMIN';
  const visibleTopics = helpTopics.filter(topic => !topic.adminOnly || isAdmin);

  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [location.hash]);

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <PageHeader title="Hilfe & Anleitungen" description="Kurze, verständliche Antworten direkt für euren Familienalltag." />
      <Alert severity="info">FamilyHub speichert nicht, welche Hilfethemen du öffnest. Alle Anleitungen sind direkt in der Anwendung enthalten.</Alert>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 2, md: 2.5 } }}>
        {visibleTopics.map(topic => <HelpTopicCard key={topic.id} topic={topic} />)}
      </Box>
      <Typography variant="body2" color="text.secondary">Fehlt etwas? Administratoren finden technische Details zusätzlich in der öffentlichen Installations- und API-Dokumentation des Projekts.</Typography>
    </Stack>
  );
}
