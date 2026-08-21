import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to={ROUTES.dashboard} className="text-indigo-600 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
