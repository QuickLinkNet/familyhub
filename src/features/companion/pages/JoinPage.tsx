import { useMemo, useState } from 'react';
import { FamilyRestroomRounded, PhoneIphoneRounded } from '@mui/icons-material';
import { Alert, Avatar, Box, Button, Card, CardContent, CircularProgress, Container, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import { ApiError } from '../../../services/apiClient';
import { MobileSetupSuccess } from '../components/MobileSetupSuccess';
import { useInvitationPreview, useRedeemMobileInvitation } from '../hooks/useCompanion';

function suggestedDeviceLabel() {
  const agent = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(agent)) return 'Mein iPhone / iPad';
  if (/Android/i.test(agent)) return 'Mein Android-Handy';
  if (/Windows/i.test(agent)) return 'Mein Windows-Gerät';
  if (/Macintosh/i.test(agent)) return 'Mein Mac';
  return 'Mein Familiengerät';
}

export function JoinPage() {
  const [params] = useSearchParams();
  const token = params.get('token')?.trim() ?? '';
  const preview = useInvitationPreview(token);
  const redeem = useRedeemMobileInvitation();
  const [deviceLabel, setDeviceLabel] = useState(suggestedDeviceLabel);
  const error = useMemo(() => {
    const cause = redeem.error ?? preview.error;
    return cause instanceof ApiError ? cause.message : cause ? 'Der Freigabelink konnte nicht geöffnet werden.' : null;
  }, [preview.error, redeem.error]);

  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2.5, md: 6 } }}>
    <Container maxWidth="sm">
      <Stack spacing={{ xs: 3, md: 4 }}>
        <Stack alignItems="center" textAlign="center" spacing={1}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}><FamilyRestroomRounded fontSize="large" /></Avatar>
          <Typography variant="h3" sx={{ fontSize: { xs: '2.1rem', md: '2.8rem' } }}>Mit FamilyHub verbinden</Typography>
          <Typography color="text.secondary">Einmal bestätigen, danach ist euer Familienalltag auf diesem Gerät erreichbar.</Typography>
        </Stack>

        {token === '' && <Alert severity="error">Im Freigabelink fehlt der Sicherheitsschlüssel.</Alert>}
        {preview.isLoading && <Stack alignItems="center" py={5}><CircularProgress /></Stack>}
        {error && <Alert severity="error">{error}</Alert>}
        {redeem.isSuccess
          ? <MobileSetupSuccess />
          : preview.data && <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 4 }, '&:last-child': { pb: { xs: 2.5, sm: 4 } } }}>
              <Stack spacing={2.5}>
                <Stack direction="row" gap={1.5} alignItems="center">
                  <MemberAvatar name={preview.data.profile.name} sx={{ bgcolor: preview.data.profile.color }} />
                  <Box><Typography variant="h6">{preview.data.profile.name}</Typography><Typography variant="body2" color="text.secondary">Dieses Profil wird auf dem Gerät angemeldet.</Typography></Box>
                </Stack>
                <Alert severity="info">Der Link ist nur einmal verwendbar. FamilyHub speichert das Gerät, damit ein Administrator es später gezielt abmelden kann.</Alert>
                <TextField
                  fullWidth
                  label="Name dieses Geräts"
                  value={deviceLabel}
                  onChange={event => setDeviceLabel(event.target.value)}
                  inputProps={{ maxLength: 60 }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneRounded /></InputAdornment> }}
                  helperText="Zum Beispiel „Eltern-Handy“ oder „Küchen-Tablet“."
                />
                <Button size="large" variant="contained" disabled={deviceLabel.trim() === '' || redeem.isPending} onClick={() => redeem.mutate({ token, deviceLabel: deviceLabel.trim() })}>
                  {redeem.isPending ? 'Wird sicher verbunden …' : 'Dieses Gerät verbinden'}
                </Button>
              </Stack>
            </CardContent>
          </Card>}
      </Stack>
    </Container>
  </Box>;
}
