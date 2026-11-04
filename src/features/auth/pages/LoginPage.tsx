import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { FamilyRestroomRounded, LockRounded, LoginRounded } from '@mui/icons-material';
import { Alert, Avatar, Box, Button, Card, CardActionArea, CardContent, CircularProgress, Container, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../services/apiClient';
import { useAuthProfiles, useLogin } from '../hooks/useAuth';
import type { AuthRole } from '../types/auth';

const roleLabels: Record<AuthRole, string> = {
  ADMIN: 'Admin',
  PARENT: 'Elternteil',
  CHILD: 'Kind'
};

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

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
          {profiles.data?.map(profile => {
            const active = selectedId === profile.id;
            return <Card key={profile.id} variant={active ? 'elevation' : 'outlined'} sx={{ border: active ? '3px solid' : undefined, borderColor: active ? profile.color : undefined }}>
              <CardActionArea onClick={() => { setSelectedId(profile.id); setSecret(''); setError(null); }} sx={{ minHeight: 154 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 1.25, bgcolor: profile.color, fontSize: '1.4rem' }}>{profile.name.charAt(0).toUpperCase()}</Avatar>
                  <Typography fontWeight={750} noWrap>{profile.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{roleLabels[profile.role]}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>;
          })}
        </Box>

        {selected && <Card component="form" onSubmit={submit}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 }, '&:last-child': { pb: { xs: 2.5, sm: 4 } } }}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: selected.color }}>{selected.name.charAt(0).toUpperCase()}</Avatar>
                <Box><Typography variant="h6">{selected.name}</Typography><Typography variant="body2" color="text.secondary">{selected.requiresSecret ? 'Zugang bestätigen' : 'Direkt starten'}</Typography></Box>
              </Stack>
              {error && <Alert severity="error">{error}</Alert>}
              {selected.requiresSecret && <TextField autoFocus fullWidth required label={selected.role === 'CHILD' ? 'PIN' : 'Passwort'} type="password" value={secret} onChange={event => setSecret(event.target.value)} autoComplete="current-password" inputProps={selected.role === 'CHILD' ? { inputMode: 'numeric', maxLength: 8 } : { maxLength: 128 }} InputProps={{ startAdornment: <InputAdornment position="start"><LockRounded color="action" /></InputAdornment> }} />}
              <Button type="submit" variant="contained" size="large" startIcon={<LoginRounded />} disabled={login.isPending} sx={{ minHeight: 54 }}>{login.isPending ? 'Wird geöffnet …' : 'Familienbereich öffnen'}</Button>
            </Stack>
          </CardContent>
        </Card>}
      </Stack>
    </Container>
  </Box>;
}
