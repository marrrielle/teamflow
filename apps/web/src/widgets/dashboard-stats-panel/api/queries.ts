import { useQuery } from '@tanstack/react-query';
import { dashboardStatsSchema, type DashboardStats } from '@teamflow/contracts';
import { apiClient } from '@/shared/api/client';

const DASHBOARD_KEYS_ROOT = ['dashboard'] as const;

interface DashboardKeys {
  all: readonly ['dashboard'];
  stats: () => readonly ['dashboard', 'stats'];
}

export const dashboardKeys = {
  all: DASHBOARD_KEYS_ROOT,
  stats: () => [...DASHBOARD_KEYS_ROOT, 'stats'] as const,
} satisfies DashboardKeys;

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      const res = await apiClient.get<DashboardStats>('/dashboard/stats');
      if (!res.ok) throw new Error(res.error.message);
      return dashboardStatsSchema.parse(res.data);
    },
  });
}
