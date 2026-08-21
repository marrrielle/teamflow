import { z } from 'zod';
import { taskStatusSchema } from './task';
import { activityLogSchema } from './activity';

export const dashboardStatsSchema = z.object({
  totalProjects: z.number(),
  totalTasks: z.number(),
  statusBreakdown: z.record(taskStatusSchema, z.number()),
  overdueCount: z.number(),
  recentActivity: z.array(activityLogSchema),
});
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
