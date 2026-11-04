import type { ReactNode } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { createBrowserRouter, Link } from 'react-router-dom';
import { AppShell } from './AppShell';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { FamilyPage } from '../features/family/pages/FamilyPage';
import { TasksPage } from '../features/tasks/pages/TasksPage';

function FutureModule() { return <Stack spacing={2}><Typography variant="h3">Bald verfuegbar</Typography><Typography color="text.secondary">Dieses Modul ist fuer die naechste Ausbaustufe vorbereitet.</Typography><Box><Button component={Link} to="/" variant="contained">Zur Uebersicht</Button></Box></Stack>; }
const shell = (content: ReactNode) => <AppShell>{content}</AppShell>;
export const appRouter = createBrowserRouter([
  { path: '/', element: shell(<DashboardPage />) },
  { path: '/family', element: shell(<FamilyPage />) },
  { path: '/tasks', element: shell(<TasksPage />) },
  { path: '/:module', element: shell(<FutureModule />) }
]);