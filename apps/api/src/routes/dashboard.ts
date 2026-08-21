import { Router } from 'express';
import { and, count, desc, lt, sql } from 'drizzle-orm';
import type { DashboardStats, TaskStatus } from '@teamflow/contracts';
import { db } from '../db/client';
import { projects, tasks, activityLog } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { toActivityDto } from '../lib/mappers';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get('/dashboard/stats', async (_req, res) => {
  const [projectCount] = await db.select({ value: count() }).from(projects);
  const [taskCount] = await db.select({ value: count() }).from(tasks);

  const statusRows = await db.select({ status: tasks.status, value: count() }).from(tasks).groupBy(tasks.status);
  const statusBreakdown = statusRows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = r.value;
    return acc;
  }, {});

  const [overdue] = await db
    .select({ value: count() })
    .from(tasks)
    .where(and(lt(tasks.dueDate, new Date()), sql`${tasks.status} != 'done'`));

  const recentRows = await db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(10);

  const data: DashboardStats = {
    totalProjects: projectCount?.value ?? 0,
    totalTasks: taskCount?.value ?? 0,
    statusBreakdown: statusBreakdown as Record<TaskStatus, number>,
    overdueCount: overdue?.value ?? 0,
    recentActivity: recentRows.map(toActivityDto),
  };
  res.json({ ok: true, data });
});
