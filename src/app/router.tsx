import type { ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { CalendarPage } from '../features/calendar/pages/CalendarPage';
import { FamilyPage } from '../features/family/pages/FamilyPage';
import { TasksPage } from '../features/tasks/pages/TasksPage';
import { AuthGate } from '../features/auth/components/AuthGate';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SetupGate } from '../features/setup/components/SetupGate';
import { SetupPage } from '../features/setup/pages/SetupPage';
import { NotFoundPage } from '../features/navigation/pages/NotFoundPage';
import { ShoppingPage } from '../features/shopping/pages/ShoppingPage';
import { AdminPage } from '../features/admin/pages/AdminPage';
import { WallPage } from '../features/wall/pages/WallPage';
import { RewardsPage } from '../features/rewards/pages/RewardsPage';

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
          { path: '/calendar', element: shell(<CalendarPage />) },
          { path: '/tasks', element: shell(<TasksPage />) },
          { path: '/rewards', element: shell(<RewardsPage />) },
          { path: '/admin', element: shell(<AdminPage />) },
          { path: '/wall', element: <WallPage /> },
          { path: '/shopping', element: shell(<ShoppingPage />) },
          { path: '*', element: shell(<NotFoundPage />) }
        ]
      }
    ]
  }
], {
  basename: import.meta.env.BASE_URL
});
