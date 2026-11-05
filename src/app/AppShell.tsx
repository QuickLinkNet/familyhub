import { useState, type ReactNode } from 'react';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { AppBottomNavigation } from '../components/organisms/AppBottomNavigation';
import { AppHeader } from '../components/organisms/AppHeader';
import { AppNavigation } from '../components/organisms/AppNavigation';
import { useAuthSession, useLogout } from '../features/auth/hooks/useAuth';
import { useHealth } from '../features/health/hooks/useHealth';

const drawerWidth = 264;

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const health = useHealth();
  const session = useAuthSession();
  const logout = useLogout();
  const user = session.data?.user ?? null;

  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 9, md: 0 } }}>
    <AppHeader user={user} signingOut={logout.isPending} onOpenNavigation={() => setDrawerOpen(true)} onSignOut={() => logout.mutate()} />
    <Drawer variant={isDesktop ? 'permanent' : 'temporary'} open={isDesktop || drawerOpen} onClose={() => setDrawerOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' } }}>
      <AppNavigation currentPath={location.pathname} systemReady={health.isSuccess} userRole={user?.role ?? null} onNavigate={() => setDrawerOpen(false)} />
    </Drawer>
    <Box component="main" sx={{ ml: { md: `${drawerWidth}px` }, px: { xs: 2, sm: 3, lg: 5 }, py: { xs: 3, md: 4 }, maxWidth: { xl: 1760 } }}>{children}</Box>
    <AppBottomNavigation currentPath={location.pathname} zIndex={theme.zIndex.appBar} />
  </Box>;
}
