import type { ReactNode } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSetupStatus } from '../hooks/useSetup';

export function SetupGate() {
  const status = useSetupStatus();
  const location = useLocation();

  if (status.isLoading) {
    return <Centered><CircularProgress /><Typography color="text.secondary">Familienkompass wird vorbereitet …</Typography></Centered>;
  }

  if (status.isError) {
    return <Centered><Alert severity="error">Die Live-API für die Einrichtung ist nicht erreichbar.</Alert><Button variant="contained" onClick={() => status.refetch()}>Erneut versuchen</Button></Centered>;
  }

  if (status.data?.required && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  if (!status.data?.required && location.pathname === '/setup') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function Centered({ children }: { children: ReactNode }) {
  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}><Stack spacing={2} alignItems="center" maxWidth={480}>{children}</Stack></Box>;
}
