import { lazy, Suspense, type ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { AuthGate } from '../features/auth/components/AuthGate';
import { SetupGate } from '../features/setup/components/SetupGate';

const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const CalendarPage = lazy(() => import('../features/calendar/pages/CalendarPage').then(module => ({ default: module.CalendarPage })));
const FamilyPage = lazy(() => import('../features/family/pages/FamilyPage').then(module => ({ default: module.FamilyPage })));
const TasksPage = lazy(() => import('../features/tasks/pages/TasksPage').then(module => ({ default: module.TasksPage })));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SetupPage = lazy(() => import('../features/setup/pages/SetupPage').then(module => ({ default: module.SetupPage })));
const NotFoundPage = lazy(() => import('../features/navigation/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const ShoppingPage = lazy(() => import('../features/shopping/pages/ShoppingPage').then(module => ({ default: module.ShoppingPage })));
const AdminPage = lazy(() => import('../features/admin/pages/AdminPage').then(module => ({ default: module.AdminPage })));
const WallPage = lazy(() => import('../features/wall/pages/WallPage').then(module => ({ default: module.WallPage })));
const RewardsPage = lazy(() => import('../features/rewards/pages/RewardsPage').then(module => ({ default: module.RewardsPage })));
const MealsPage = lazy(() => import('../features/meals/pages/MealsPage').then(module => ({ default: module.MealsPage })));

const fallback = <Box display="grid" sx={{ minHeight: 240, placeItems: 'center' }}><CircularProgress aria-label="Ansicht wird geladen" /></Box>;
const deferred = (content: ReactNode) => <Suspense fallback={fallback}>{content}</Suspense>;
const shell = (content: ReactNode) => <AppShell>{deferred(content)}</AppShell>;

export const appRouter = createBrowserRouter([
  {
    element: <SetupGate />,
    children: [
      { path: '/setup', element: deferred(<SetupPage />) },
      {
        element: <AuthGate />,
        children: [
          { path: '/login', element: deferred(<LoginPage />) },
          { path: '/', element: shell(<DashboardPage />) },
          { path: '/family', element: shell(<FamilyPage />) },
          { path: '/calendar', element: shell(<CalendarPage />) },
          { path: '/tasks', element: shell(<TasksPage />) },
          { path: '/rewards', element: shell(<RewardsPage />) },
          { path: '/meals', element: shell(<MealsPage />) },
          { path: '/admin', element: shell(<AdminPage />) },
          { path: '/wall', element: deferred(<WallPage />) },
          { path: '/shopping', element: shell(<ShoppingPage />) },
          { path: '*', element: shell(<NotFoundPage />) }
        ]
      }
    ]
  }
], {
  basename: import.meta.env.BASE_URL
});
