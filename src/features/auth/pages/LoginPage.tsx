import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { FamilyRestroomRounded } from '@mui/icons-material';
import { Alert, Avatar, Box, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../services/apiClient';
import { LoginCard } from '../components/LoginCard';
import { ProfileSelector } from '../components/ProfileSelector';
import { useAuthProfiles, useLogin } from '../hooks/useAuth';

export function LoginPage() {
  const profiles = useAuthProfiles();
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedId, setSelectedId] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const selected = useMemo(() => profiles.data?.find(profile => profile.id === selectedId) ?? null, [profiles.data, selectedId]);

  useEffect(() => {
    if (selectedId === '' && profiles.data?.length === 1) {
      setSelectedId(profiles.data[0].id);
    }
  }, [profiles.data, selectedId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) {
      setError('Bitte zuerst ein Familienprofil auswählen.');
      return;
    }
    setError(null);
    try {
      await login.mutateAsync({ memberId: selected.id, secret });
      const target = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(target, { replace: true });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Die Anmeldung ist fehlgeschlagen.');
    }
  };

  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2.5, md: 6 } }}>
    <Container maxWidth="md">
      <Stack spacing={{ xs: 3, md: 4 }}>
        <Stack alignItems="center" textAlign="center" spacing={1}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}><FamilyRestroomRounded fontSize="large" /></Avatar>
          <Typography variant="h3" sx={{ fontSize: { xs: '2.2rem', md: '3rem' } }}>Wer ist gerade da?</Typography>
          <Typography color="text.secondary">Wähle dein Profil und öffne euren Familienbereich.</Typography>
        </Stack>

        {profiles.isLoading && <Box textAlign="center"><CircularProgress /></Box>}
        {profiles.isError && <Alert severity="error">Die Familienprofile konnten nicht geladen werden.</Alert>}
        {profiles.data?.length === 0 && <Alert severity="warning">Es wurden noch keine aktiven Familienprofile gefunden.</Alert>}

        <ProfileSelector profiles={profiles.data ?? []} selectedId={selectedId} onSelect={profileId => { setSelectedId(profileId); setSecret(''); setError(null); }} />
        {selected && <LoginCard profile={selected} secret={secret} error={error} pending={login.isPending} onSecretChange={setSecret} onSubmit={submit} />}
      </Stack>
    </Container>
  </Box>;
}
