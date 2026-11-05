import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { AuthProfile, AuthRole } from '../types/auth';

const roleLabels: Record<AuthRole, string> = { ADMIN: 'Admin', PARENT: 'Elternteil', CHILD: 'Kind' };

interface ProfileSelectorProps {
  profiles: AuthProfile[];
  selectedId: string;
  onSelect: (profileId: string) => void;
}

export function ProfileSelector({ profiles, selectedId, onSelect }: ProfileSelectorProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
      {profiles.map(profile => {
        const active = selectedId === profile.id;
        return (
          <Card key={profile.id} variant={active ? 'elevation' : 'outlined'} sx={{ border: active ? '3px solid' : undefined, borderColor: active ? profile.color : undefined }}>
            <CardActionArea onClick={() => onSelect(profile.id)} sx={{ minHeight: 154 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <MemberAvatar name={profile.name} sx={{ width: 64, height: 64, mx: 'auto', mb: 1.25, bgcolor: profile.color, fontSize: '1.4rem' }} />
                <Typography fontWeight={750} noWrap>{profile.name}</Typography>
                <Typography variant="body2" color="text.secondary">{roleLabels[profile.role]}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
}
