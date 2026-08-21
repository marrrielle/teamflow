import { useAuth } from '@/entities/user';
import { DashboardStatsPanel } from '@/widgets/dashboard-stats-panel';

export function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Welcome{user ? `, ${user.name}` : ''}</h1>
      <DashboardStatsPanel />
    </div>
  );
}
