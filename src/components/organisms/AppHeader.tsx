import { useState, type MouseEvent } from 'react';
import { LogoutRounded, MenuRounded, MoreHorizRounded } from '@mui/icons-material';
import { AppBar, Box, Chip, IconButton, ListItemIcon, Menu, MenuItem, Stack, Toolbar } from '@mui/material';
import { MemberAvatar } from '../atoms/MemberAvatar';
import { ReminderCenter } from '../../features/reminders/components/ReminderCenter';

interface AppHeaderProps {
  user: { name: string; color: string } | null;
  signingOut: boolean;
  onOpenNavigation: () => void;
  onSignOut: () => void;
}

export function AppHeader({ user, signingOut, onOpenNavigation, onSignOut }: AppHeaderProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const openMenu = (event: MouseEvent<HTMLElement>) => setMenuAnchor(event.currentTarget);
  const closeMenu = () => setMenuAnchor(null);
  const signOut = () => {
    closeMenu();
    onSignOut();
  };

  return (
    <>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(12px)', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: { xs: 68, md: 76 } }}>
          <IconButton aria-label="Navigation öffnen" onClick={onOpenNavigation} sx={{ display: { md: 'none' } }}>
            <MenuRounded />
          </IconButton>
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={1} alignItems="center">
            <ReminderCenter />
            {user && <Chip avatar={<MemberAvatar name={user.name} sx={{ bgcolor: user.color }} />} label={user.name} variant="outlined" />}
            <IconButton aria-label="Profilmenü öffnen" onClick={openMenu}><MoreHorizRounded /></IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={signOut} disabled={signingOut}>
          <ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>
          Abmelden
        </MenuItem>
      </Menu>
    </>
  );
}
