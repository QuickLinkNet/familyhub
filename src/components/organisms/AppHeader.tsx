import { useState, type MouseEvent } from 'react';
import { DashboardCustomizeRounded, HelpOutlineRounded, LogoutRounded, MenuRounded, MoreHorizRounded, TvRounded } from '@mui/icons-material';
import { AppBar, Box, Chip, IconButton, ListItemIcon, Menu, MenuItem, Stack, Toolbar, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { MemberAvatar } from '../atoms/MemberAvatar';
import { ReminderCenter } from '../../features/reminders/components/ReminderCenter';
import { DisplaySetupDialog } from '../../features/wall/components/DisplaySetupDialog';
import { PersonalizationDialog } from '../../features/preferences/components/PersonalizationDialog';

interface AppHeaderProps {
  user: { name: string; color: string } | null;
  signingOut: boolean;
  onOpenNavigation: () => void;
  onSignOut: () => void;
}

export function AppHeader({ user, signingOut, onOpenNavigation, onSignOut }: AppHeaderProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [idleDialogOpen, setIdleDialogOpen] = useState(false);
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const openMenu = (event: MouseEvent<HTMLElement>) => setMenuAnchor(event.currentTarget);
  const closeMenu = () => setMenuAnchor(null);
  const signOut = () => {
    closeMenu();
    onSignOut();
  };
  const openIdleDialog = () => {
    closeMenu();
    setIdleDialogOpen(true);
  };
  const openPersonalization = () => {
    closeMenu();
    setPersonalizationOpen(true);
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
            <Tooltip title="Hilfe & Anleitungen"><IconButton component={Link} to="/help" aria-label="Hilfe und Anleitungen öffnen"><HelpOutlineRounded /></IconButton></Tooltip>
            {user && <Chip avatar={<MemberAvatar name={user.name} sx={{ bgcolor: user.color }} />} label={user.name} variant="outlined" />}
            <IconButton aria-label="Profilmenü öffnen" onClick={openMenu}><MoreHorizRounded /></IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={openPersonalization}>
          <ListItemIcon><DashboardCustomizeRounded fontSize="small" /></ListItemIcon>
          Ansicht & Ruhezeiten
        </MenuItem>
        <MenuItem onClick={openIdleDialog}>
          <ListItemIcon><TvRounded fontSize="small" /></ListItemIcon>
          Familienboard einrichten
        </MenuItem>
        <MenuItem onClick={signOut} disabled={signingOut}>
          <ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>
          Abmelden
        </MenuItem>
      </Menu>
      <PersonalizationDialog open={personalizationOpen} onClose={() => setPersonalizationOpen(false)} />
      <DisplaySetupDialog open={idleDialogOpen} onClose={() => setIdleDialogOpen(false)} />
    </>
  );
}
