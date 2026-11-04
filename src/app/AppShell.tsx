import type { ReactNode } from 'react';
import { CalendarMonthRounded, ChecklistRounded, DashboardRounded, FamilyRestroomRounded, MenuRounded, MoreHorizRounded, ShoppingBasketRounded } from '@mui/icons-material';
import { AppBar, BottomNavigation, BottomNavigationAction, Box, Chip, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useHealth } from '../features/health/hooks/useHealth';

const drawerWidth = 264;
const navigation = [
  { label: 'Übersicht', path: '/', icon: <DashboardRounded /> },
  { label: 'Kalender', path: '/calendar', icon: <CalendarMonthRounded /> },
  { label: 'Aufgaben', path: '/tasks', icon: <ChecklistRounded /> },
  { label: 'Familie', path: '/family', icon: <FamilyRestroomRounded /> },
  { label: 'Einkauf', path: '/shopping', icon: <ShoppingBasketRounded /> }
];

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme(); const isDesktop = useMediaQuery(theme.breakpoints.up('md')); const [open, setOpen] = useState(false); const location = useLocation(); const health = useHealth();
  const currentIndex = Math.max(0, navigation.findIndex(({ path }) => path === location.pathname));
  const nav = <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}><Box sx={{ p: 3 }}><Typography variant="h5" color="primary">Familienkompass</Typography><Typography variant="body2" color="text.secondary" mt={0.5}>Euer Alltag, gemeinsam.</Typography></Box><Divider /><List sx={{ p: 1.5 }}>{navigation.map(item => <ListItemButton key={item.path} component={Link} to={item.path} selected={location.pathname === item.path} onClick={() => setOpen(false)} sx={{ minHeight: 52, borderRadius: 3, mb: 0.5 }}><ListItemIcon sx={{ minWidth: 42 }}>{item.icon}</ListItemIcon><ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 650 }} /></ListItemButton>)}</List><Box sx={{ mt: 'auto', p: 2.5 }}><Chip size="small" color={health.isSuccess ? 'success' : 'default'} label={health.isSuccess ? 'System bereit' : 'System wird geprüft'} /></Box></Box>;
  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 9, md: 0 } }}><AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(12px)', borderBottom: '1px solid', borderColor: 'divider' }}><Toolbar sx={{ minHeight: { xs: 68, md: 76 } }}><IconButton aria-label="Navigation öffnen" onClick={() => setOpen(true)} sx={{ display: { md: 'none' } }}><MenuRounded /></IconButton><Box sx={{ flex: 1 }} /><Stack direction="row" spacing={1} alignItems="center"><Chip label="Familie" variant="outlined" /><IconButton aria-label="Weitere Optionen"><MoreHorizRounded /></IconButton></Stack></Toolbar></AppBar><Drawer variant={isDesktop ? 'permanent' : 'temporary'} open={isDesktop || open} onClose={() => setOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' } }}>{nav}</Drawer><Box component="main" sx={{ ml: { md: `${drawerWidth}px` }, px: { xs: 2, sm: 3, lg: 5 }, py: { xs: 3, md: 4 }, maxWidth: { xl: 1760 } }}>{children}</Box><BottomNavigation showLabels value={currentIndex} sx={{ display: { md: 'none' }, position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: theme.zIndex.appBar, boxShadow: '0 -4px 20px rgba(38, 68, 52, 0.12)' }}>{navigation.slice(0, 4).map((item, index) => <BottomNavigationAction key={item.path} component={Link} to={item.path} value={index} label={item.label} icon={item.icon} />)}</BottomNavigation></Box>;
}
