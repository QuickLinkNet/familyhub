import { useState, type ReactNode } from 'react';
import { AddRounded, PersonAddAlt1Rounded } from '@mui/icons-material';
import { Alert, Box, Button, Skeleton, Stack } from '@mui/material';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { AddMemberDialog } from '../components/AddMemberDialog';
import { FamilyMemberCard } from '../components/FamilyMemberCard';
import { useFamilyMembers } from '../hooks/useFamilyMembers';

export function FamilyPage() {
  const family = useFamilyMembers();
  const session = useAuthSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const canManage = session.data?.user?.role !== 'CHILD';
  const addButton = canManage ? <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialogOpen(true)}>Familienmitglied hinzufügen</Button> : undefined;

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <PageHeader title="Unsere Familie" description="Alle Personen, Farben und Rollen an einem Ort." actions={addButton} />
      {family.isError && <Alert severity="error">{family.error instanceof ApiError ? family.error.message : 'Familienmitglieder konnten nicht geladen werden.'}</Alert>}
      {family.isLoading
        ? <FamilyGrid>{[0, 1, 2].map(index => <Skeleton key={index} variant="rounded" height={180} />)}</FamilyGrid>
        : family.data?.length === 0
          ? canManage
            ? <EmptyStateCard icon={<PersonAddAlt1Rounded color="primary" sx={{ fontSize: 56 }} />} title="Beginnt mit eurer Familie" description="Lege zuerst die Familienmitglieder an. Ihre Farben werden später in Kalendern, Aufgaben und Routinen wiederverwendet." action={<Button variant="contained" sx={{ mt: 2 }} onClick={() => setDialogOpen(true)}>Erstes Familienmitglied hinzufügen</Button>} />
            : <Alert severity="info">Noch keine Familienprofile vorhanden.</Alert>
          : <FamilyGrid>{family.data?.map(member => <FamilyMemberCard key={member.id} member={member} />)}</FamilyGrid>}
      {canManage && <AddMemberDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />}
    </Stack>
  );
}

function FamilyGrid({ children }: { children: ReactNode }) {
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>{children}</Box>;
}
