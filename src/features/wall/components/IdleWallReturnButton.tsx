import { TouchAppRounded } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { idleWallReturnPathKey, isSafeWallReturnPath } from '../services/idleWallModeStore';

export function IdleWallReturnButton() {
  const navigate = useNavigate();
  const returnToFamily = () => {
    const storedPath = sessionStorage.getItem(idleWallReturnPathKey);
    sessionStorage.removeItem(idleWallReturnPathKey);
    navigate(isSafeWallReturnPath(storedPath) ? storedPath : '/', { replace: true });
  };

  return (
    <Button
      variant="contained"
      size="large"
      startIcon={<TouchAppRounded />}
      onClick={returnToFamily}
      sx={{
        position: 'fixed', zIndex: theme => theme.zIndex.tooltip, left: '50%', bottom: { xs: 18, md: 28 },
        transform: 'translateX(-50%)', whiteSpace: 'nowrap', px: 3, py: 1.35,
        boxShadow: '0 14px 38px rgba(24,52,38,.3)'
      }}
    >
      Zurück zum Familienbereich
    </Button>
  );
}
