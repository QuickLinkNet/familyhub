import { AddRounded, DeleteOutlineRounded, PeopleRounded } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import { memberColors } from '../../../theme/memberPalette';
import type { SetupMemberDraft } from '../types/setupDraft';
import { setupRoleLabels } from '../types/setupDraft';
import type { SetupRole } from '../types/setup';

interface FamilyStepProps {
  members: SetupMemberDraft[];
  onUpdate: <K extends keyof SetupMemberDraft>(id: string, key: K, value: SetupMemberDraft[K]) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function FamilyStep({ members, onUpdate, onAdd, onRemove }: FamilyStepProps) {
  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}><PeopleRounded /></Avatar>
          <Box><Typography variant="h5">Wer gehört dazu?</Typography><Typography color="text.secondary">Bis zu 12 Personen mit eigener Rolle und Farbe.</Typography></Box>
        </Stack>
        <Button startIcon={<AddRounded />} onClick={onAdd}>Person hinzufügen</Button>
      </Stack>
      {members.map((member, index) => (
        <Card key={member.clientId} variant="outlined">
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MemberAvatar name={member.name || String(index + 1)} sx={{ bgcolor: member.color }} />
                <Typography fontWeight={700}>Person {index + 1}</Typography>
              </Stack>
              <IconButton aria-label="Person entfernen" disabled={members.length === 1} onClick={() => onRemove(member.clientId)}><DeleteOutlineRounded /></IconButton>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.4fr 1fr' }, gap: 2 }}>
              <TextField required label="Name" value={member.name} onChange={event => onUpdate(member.clientId, 'name', event.target.value)} inputProps={{ maxLength: 80 }} />
              <FormControl>
                <InputLabel id={`role-${member.clientId}`}>Rolle</InputLabel>
                <Select labelId={`role-${member.clientId}`} label="Rolle" value={member.role} onChange={event => onUpdate(member.clientId, 'role', event.target.value as SetupRole)}>
                  {(Object.keys(setupRoleLabels) as SetupRole[]).map(role => <MenuItem key={role} value={role}>{setupRoleLabels[role]}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box mt={2}>
              {member.role === 'CHILD'
                ? <TextField fullWidth label="Kinder-PIN (optional)" type="password" value={member.pin ?? ''} onChange={event => onUpdate(member.clientId, 'pin', event.target.value)} helperText="4 bis 8 Ziffern für den einfachen Touchscreen-Zugang" inputProps={{ inputMode: 'numeric', maxLength: 8 }} />
                : <TextField fullWidth required label="Passwort" type="password" autoComplete="new-password" value={member.password ?? ''} onChange={event => onUpdate(member.clientId, 'password', event.target.value)} helperText="Mindestens 8 Zeichen" inputProps={{ maxLength: 128 }} />}
            </Box>
            <Stack direction="row" gap={1} flexWrap="wrap" mt={2}>
              {memberColors.map(color => <Button key={color} aria-label={`Farbe ${color}`} onClick={() => onUpdate(member.clientId, 'color', color)} sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', bgcolor: color, border: member.color === color ? '4px solid white' : '2px solid transparent', outline: member.color === color ? `3px solid ${color}` : 'none', '&:hover': { bgcolor: color } }} />)}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
