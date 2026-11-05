import { Box, Chip, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { navigationItems } from '../../app/navigation';

interface AppNavigationProps {
  currentPath: string;
  systemReady: boolean;
  onNavigate: () => void;
}

export function AppNavigation({ currentPath, systemReady, onNavigate }: AppNavigationProps) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="primary">Familienkompass</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>Euer Alltag, gemeinsam.</Typography>
      </Box>
      <Divider />
      <List sx={{ p: 1.5 }}>
        {navigationItems.map(item => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            selected={currentPath === item.path}
            onClick={onNavigate}
            sx={{ minHeight: 52, borderRadius: 3, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 42 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 650 }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2.5 }}>
        <Chip size="small" color={systemReady ? 'success' : 'default'} label={systemReady ? 'System bereit' : 'System wird geprüft'} />
      </Box>
    </Box>
  );
}
