import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { createProjectSchema, updateProjectSchema, type ProjectId, type UserId } from '@teamflow/contracts';
import { db } from '../db/client';
import { projects, activityLog } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/error-handler';
import { toProjectDto } from '../lib/mappers';

export const projectsRouter = Router();
projectsRouter.use(requireAuth);

projectsRouter.get('/projects', async (_req, res) => {
  const rows = await db.select().from(projects);
  res.json({ ok: true, data: rows.map(toProjectDto) });
});

projectsRouter.post('/projects', async (req, res) => {
  const body = createProjectSchema.parse(req.body);
  const [row] = await db
    .insert(projects)
    .values({
      name: body.name,
      description: body.description ?? null,
      color: body.color,
      ownerId: req.userId as UserId,
    })
    .returning();
  if (!row) throw new AppError(500, 'Failed to create project');

  await db.insert(activityLog).values({
    type: 'project_created',
    entityType: 'project',
    entityId: row.id,
    userId: req.userId as UserId,
    metadata: { name: row.name },
  });

  res.status(201).json({ ok: true, data: toProjectDto(row) });
});

projectsRouter.get('/projects/:id', async (req, res) => {
  const [row] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, req.params.id as ProjectId))
    .limit(1);
  if (!row) throw new AppError(404, 'Project not found');
  res.json({ ok: true, data: toProjectDto(row) });
});

projectsRouter.patch('/projects/:id', async (req, res) => {
  const body = updateProjectSchema.parse(req.body);
  const [row] = await db
    .update(projects)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(projects.id, req.params.id as ProjectId))
    .returning();
  if (!row) throw new AppError(404, 'Project not found');

  await db.insert(activityLog).values({
    type: 'project_updated',
    entityType: 'project',
    entityId: row.id,
    userId: req.userId as UserId,
    metadata: { name: row.name },
  });

  res.json({ ok: true, data: toProjectDto(row) });
});

projectsRouter.delete('/projects/:id', async (req, res) => {
  const [row] = await db
    .delete(projects)
    .where(eq(projects.id, req.params.id as ProjectId))
    .returning();
  if (!row) throw new AppError(404, 'Project not found');
  res.status(204).end();
});
