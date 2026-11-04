import type { ReactNode } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthSession } from '../hooks/useAuth';

export function AuthGate() {
  const session = useAuthSession();
  const location = useLocation();
  const onLoginPage = location.pathname === '/login';

  if (session.isLoading) {
    return <Centered><CircularProgress /><Typography color="text.secondary">Sicherer Familienbereich wird geöffnet …</Typography></Centered>;
  }

  if (session.isError) {
    return <Centered><Alert severity="error">Die Anmeldung konnte nicht geprüft werden.</Alert><Button variant="contained" onClick={() => session.refetch()}>Erneut versuchen</Button></Centered>;
  }

  if (!session.data?.authenticated && !onLoginPage) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (session.data?.authenticated && onLoginPage) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function Centered({ children }: { children: ReactNode }) {
  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}><Stack spacing={2} alignItems="center" maxWidth={480}>{children}</Stack></Box>;
}
