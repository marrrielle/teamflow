import { z } from 'zod';
import { projectIdSchema, userIdSchema } from './ids';

export const projectSchema = z.object({
  id: projectIdSchema,
  name: z.string().min(1).max(120),
  description: z.string().max(2000).nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'must be a hex color'),
  ownerId: userIdSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Project = z.infer<typeof projectSchema>;

export const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'must be a hex color'),
});
export type CreateProjectRequest = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;
