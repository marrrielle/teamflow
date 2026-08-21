import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useAuth } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { AppShell } from '@/widgets/app-shell';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { ProjectsListPage } from '@/pages/projects-list';
import { ProjectDetailPage } from '@/pages/project-detail';
import { TaskDetailPage } from '@/pages/task-detail';
import { NotFoundPage } from '@/pages/not-found';

function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">Loading…</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

const router = createBrowserRouter([
  { path: ROUTES.login, element: <LoginPage /> },
  {
    element: <ProtectedLayout />,
    children: [
      { path: ROUTES.dashboard, element: <DashboardPage /> },
      { path: ROUTES.projects, element: <ProjectsListPage /> },
      { path: ROUTES.projectDetail, element: <ProjectDetailPage /> },
      { path: ROUTES.taskDetail, element: <TaskDetailPage /> },
    ],
  },
  { path: ROUTES.notFound, element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
