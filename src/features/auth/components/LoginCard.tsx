import type { FormEvent } from 'react';
import { LockRounded, LoginRounded } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { AuthProfile } from '../types/auth';

interface LoginCardProps {
  profile: AuthProfile;
  secret: string;
  error: string | null;
  pending: boolean;
  onSecretChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

export function LoginCard({ profile, secret, error, pending, onSecretChange, onSubmit }: LoginCardProps) {
  return (
    <Card component="form" onSubmit={onSubmit}>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 }, '&:last-child': { pb: { xs: 2.5, sm: 4 } } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <MemberAvatar name={profile.name} sx={{ bgcolor: profile.color }} />
            <Box>
              <Typography variant="h6">{profile.name}</Typography>
              <Typography variant="body2" color="text.secondary">{profile.requiresSecret ? 'Zugang bestätigen' : 'Direkt starten'}</Typography>
            </Box>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          {profile.requiresSecret && (
            <TextField
              autoFocus
              fullWidth
              required
              label={profile.role === 'CHILD' ? 'PIN' : 'Passwort'}
              type="password"
              value={secret}
              onChange={event => onSecretChange(event.target.value)}
              autoComplete="current-password"
              inputProps={profile.role === 'CHILD' ? { inputMode: 'numeric', maxLength: 8 } : { maxLength: 128 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockRounded color="action" /></InputAdornment> }}
            />
          )}
          <Button type="submit" variant="contained" size="large" startIcon={<LoginRounded />} disabled={pending} sx={{ minHeight: 54 }}>
            {pending ? 'Wird geöffnet …' : 'Familienbereich öffnen'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
