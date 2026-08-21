import { Router } from 'express';
import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm';
import {
  createTaskSchema,
  updateTaskSchema,
  taskFiltersSchema,
  type ProjectId,
  type TaskId,
  type UserId,
} from '@teamflow/contracts';
import { db } from '../db/client';
import { tasks, activityLog } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/error-handler';
import { toTaskDto } from '../lib/mappers';

export const tasksRouter = Router();
tasksRouter.use(requireAuth);

tasksRouter.get('/projects/:projectId/tasks', async (req, res) => {
  const filters = taskFiltersSchema.parse(req.query);
  const projectId = req.params.projectId as ProjectId;

  const conditions = [eq(tasks.projectId, projectId)];
  if (filters.status) conditions.push(eq(tasks.status, filters.status));
  if (filters.priority) conditions.push(eq(tasks.priority, filters.priority));
  if (filters.assigneeId) conditions.push(eq(tasks.assigneeId, filters.assigneeId));
  if (filters.search) conditions.push(ilike(tasks.title, `%${filters.search}%`));

  const sortColumn = filters.sortBy ? tasks[filters.sortBy] : tasks.position;
  const orderFn = filters.sortOrder === 'desc' ? desc : asc;

  const rows = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(orderFn(sortColumn));
  res.json({ ok: true, data: rows.map(toTaskDto) });
});

tasksRouter.post('/projects/:projectId/tasks', async (req, res) => {
  const body = createTaskSchema.parse(req.body);
  const projectId = req.params.projectId as ProjectId;

  const [maxRow] = await db
    .select({ maxPosition: sql<number | null>`max(${tasks.position})` })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  const [row] = await db
    .insert(tasks)
    .values({
      projectId,
      title: body.title,
      description: body.description ?? null,
      priority: body.priority,
      assigneeId: body.assigneeId ?? null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      position: (maxRow?.maxPosition ?? 0) + 1,
    })
    .returning();
  if (!row) throw new AppError(500, 'Failed to create task');

  await db.insert(activityLog).values({
    type: 'task_created',
    entityType: 'task',
    entityId: row.id,
    userId: req.userId as UserId,
    metadata: { title: row.title },
  });

  res.status(201).json({ ok: true, data: toTaskDto(row) });
});

tasksRouter.get('/tasks/:id', async (req, res) => {
  const [row] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, req.params.id as TaskId))
    .limit(1);
  if (!row) throw new AppError(404, 'Task not found');
  res.json({ ok: true, data: toTaskDto(row) });
});

tasksRouter.patch('/tasks/:id', async (req, res) => {
  const body = updateTaskSchema.parse(req.body);
  const taskId = req.params.id as TaskId;

  const [existing] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!existing) throw new AppError(404, 'Task not found');

  const { dueDate, ...rest } = body;
  const updates: Partial<typeof tasks.$inferInsert> = { ...rest, updatedAt: new Date() };
  if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;

  const [row] = await db.update(tasks).set(updates).where(eq(tasks.id, taskId)).returning();
  if (!row) throw new AppError(404, 'Task not found');

  if (body.status && body.status !== existing.status) {
    await db.insert(activityLog).values({
      type: body.status === 'done' ? 'task_completed' : 'task_status_changed',
      entityType: 'task',
      entityId: row.id,
      userId: req.userId as UserId,
      metadata: { title: existing.title, from: existing.status, to: body.status },
    });
  }

  res.json({ ok: true, data: toTaskDto(row) });
});

tasksRouter.delete('/tasks/:id', async (req, res) => {
  const [row] = await db
    .delete(tasks)
    .where(eq(tasks.id, req.params.id as TaskId))
    .returning();
  if (!row) throw new AppError(404, 'Task not found');

  await db.insert(activityLog).values({
    type: 'task_deleted',
    entityType: 'task',
    entityId: row.id,
    userId: req.userId as UserId,
    metadata: { title: row.title },
  });

  res.status(204).end();
});
