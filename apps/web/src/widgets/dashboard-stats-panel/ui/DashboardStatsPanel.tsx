import { useUsersQuery } from '@/entities/user';
import { EmptyState, Skeleton } from '@/shared/ui';
import { useDashboardStatsQuery } from '../api/queries';
import { StatCard } from './StatCard';
import { StatusBreakdownChart } from './StatusBreakdownChart';
import { ActivityFeed } from './ActivityFeed';

export function DashboardStatsPanel() {
  const statsQuery = useDashboardStatsQuery();
  const usersQuery = useUsersQuery();

  if (statsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-56" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (statsQuery.isError) {
    return (
      <EmptyState
        title="Couldn't load dashboard stats"
        description={statsQuery.error instanceof Error ? statsQuery.error.message : 'Please try again.'}
      />
    );
  }

  const stats = statsQuery.data;
  if (!stats) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Projects" value={stats.totalProjects} />
        <StatCard label="Tasks" value={stats.totalTasks} />
        <StatCard label="Done" value={stats.statusBreakdown.done ?? 0} />
        <StatCard label="Overdue" value={stats.overdueCount} accent="warning" />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tasks by status</h2>
        <StatusBreakdownChart statusBreakdown={stats.statusBreakdown} />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Recent activity</h2>
        <ActivityFeed activity={stats.recentActivity} users={usersQuery.data ?? []} />
      </div>
    </div>
  );
}
