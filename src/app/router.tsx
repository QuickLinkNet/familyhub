import type { ReactNode } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { createBrowserRouter, Link } from 'react-router-dom';
import { AppShell } from './AppShell';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { FamilyPage } from '../features/family/pages/FamilyPage';
import { TasksPage } from '../features/tasks/pages/TasksPage';
import { AuthGate } from '../features/auth/components/AuthGate';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SetupGate } from '../features/setup/components/SetupGate';
import { SetupPage } from '../features/setup/pages/SetupPage';

function FutureModule() {
  return (
    <Stack spacing={2}>
      <Typography variant="h3">Bald verfügbar</Typography>
      <Typography color="text.secondary">Dieses Modul ist für die nächste Ausbaustufe vorbereitet.</Typography>
      <Box><Button component={Link} to="/" variant="contained">Zur Übersicht</Button></Box>
    </Stack>
  );
}

const shell = (content: ReactNode) => <AppShell>{content}</AppShell>;

export const appRouter = createBrowserRouter([
  {
    element: <SetupGate />,
    children: [
      { path: '/setup', element: <SetupPage /> },
      {
        element: <AuthGate />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/', element: shell(<DashboardPage />) },
          { path: '/family', element: shell(<FamilyPage />) },
          { path: '/tasks', element: shell(<TasksPage />) },
          { path: '/:module', element: shell(<FutureModule />) }
        ]
      }
    ]
  }
], {
  basename: import.meta.env.BASE_URL
});
