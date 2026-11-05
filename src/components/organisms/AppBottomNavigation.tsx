import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Link } from 'react-router-dom';
import { navigationItems } from '../../app/navigation';

interface AppBottomNavigationProps {
  currentPath: string;
  zIndex: number;
}

export function AppBottomNavigation({ currentPath, zIndex }: AppBottomNavigationProps) {
  const mobileItems = navigationItems.filter(item => item.mobile);
  const currentIndex = mobileItems.findIndex(item => item.path === currentPath);

  return (
    <BottomNavigation
      showLabels
      value={currentIndex}
      sx={{ display: { md: 'none' }, position: 'fixed', bottom: 0, left: 0, right: 0, zIndex, boxShadow: '0 -4px 20px rgba(38, 68, 52, 0.12)' }}
    >
      {mobileItems.map((item, index) => (
        <BottomNavigationAction key={item.path} component={Link} to={item.path} value={index} label={item.label} icon={item.icon} />
      ))}
    </BottomNavigation>
  );
}
