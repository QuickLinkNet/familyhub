import { useEffect, useState } from 'react';
import { CheckCircleRounded, ContentCopyRounded, QrCode2Rounded, ShareRounded } from '@mui/icons-material';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, Typography, useTheme } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { ApiError } from '../../../services/apiClient';
import type { FamilyMember } from '../../family/types/familyMember';
import { useCreateMobileInvitation } from '../hooks/useCompanion';

type Props = {
  open: boolean;
  members: FamilyMember[];
  defaultMemberId?: string;
  onClose: () => void;
};

export function ConnectMobileDialog({ open, members, defaultMemberId, onClose }: Props) {
  const theme = useTheme();
  const invitation = useCreateMobileInvitation();
  const [memberId, setMemberId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    invitation.reset();
    setCopied(false);
    setMemberId(defaultMemberId && members.some(member => member.id === defaultMemberId) ? defaultMemberId : members[0]?.id ?? '');
  }, [defaultMemberId, members, open]);

  const create = () => { if (memberId) invitation.mutate(memberId); };
  const copy = async () => {
    if (!invitation.data) return;
    await navigator.clipboard.writeText(invitation.data.url);
    setCopied(true);
  };
  const share = async () => {
    if (!invitation.data || !navigator.share) return;
    await navigator.share({ title: 'FamilyHub verbinden', text: `${invitation.data.profile.name} mit FamilyHub verbinden`, url: invitation.data.url });
  };

  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><QrCode2Rounded color="primary" /> Handy verbinden</DialogTitle>
    <DialogContent>
      <Stack spacing={2.5} pt={0.5}>
        {!invitation.data && <>
          <Typography color="text.secondary">Wähle das Profil, das auf dem Handy geöffnet werden soll. Der Link funktioniert einmalig und läuft nach zehn Minuten ab.</Typography>
          <FormControl fullWidth>
            <InputLabel id="mobile-profile-label">Familienprofil</InputLabel>
            <Select labelId="mobile-profile-label" label="Familienprofil" value={memberId} onChange={event => setMemberId(event.target.value)}>
              {members.filter(member => member.isActive).map(member => <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>)}
            </Select>
          </FormControl>
        </>}
        {invitation.error && <Alert severity="error">{invitation.error instanceof ApiError ? invitation.error.message : 'Der Freigabelink konnte nicht erstellt werden.'}</Alert>}
        {invitation.data && <>
          <Alert severity="success" icon={<CheckCircleRounded />}>Freigabelink für {invitation.data.profile.name} ist bereit.</Alert>
          <Box sx={{ alignSelf: 'center', p: 2, bgcolor: 'common.white', borderRadius: 2, lineHeight: 0 }}>
            <QRCodeSVG value={invitation.data.url} size={224} level="M" bgColor={theme.palette.common.white} fgColor={theme.palette.common.black} marginSize={1} title="FamilyHub-Freigabelink" />
          </Box>
          <Typography variant="body2" color="text.secondary" textAlign="center">Mit der Handykamera scannen oder den Link sicher teilen. Nach der ersten Verwendung ist er automatisch ungültig.</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} justifyContent="center">
            <Button variant="outlined" startIcon={copied ? <CheckCircleRounded /> : <ContentCopyRounded />} onClick={() => void copy()}>{copied ? 'Kopiert' : 'Link kopieren'}</Button>
            {typeof navigator.share === 'function' && <Button variant="outlined" startIcon={<ShareRounded />} onClick={() => void share()}>Sicher teilen</Button>}
          </Stack>
        </>}
      </Stack>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button onClick={onClose}>Schließen</Button>
      {!invitation.data && <Button variant="contained" disabled={!memberId || invitation.isPending} onClick={create}>{invitation.isPending ? 'Wird erstellt …' : 'Freigabelink erstellen'}</Button>}
      {invitation.data && <Button variant="contained" onClick={() => invitation.reset()}>Neuen Link erstellen</Button>}
    </DialogActions>
  </Dialog>;
}
