import { z } from 'zod';
import { userIdSchema } from './ids';

export const activityTypeSchema = z.enum([
  'task_created',
  'task_status_changed',
  'task_completed',
  'task_assigned',
  'task_deleted',
  'project_created',
  'project_updated',
]);
export type ActivityType = z.infer<typeof activityTypeSchema>;

export const activityEntityTypeSchema = z.enum(['project', 'task']);
export type ActivityEntityType = z.infer<typeof activityEntityTypeSchema>;

// entityId is polymorphic (a ProjectId or a TaskId depending on entityType) and is
// only ever displayed, never compared against a specific branded id — branding it
// would require an unwieldy union for no real type-safety gain, so it stays a plain
// string keyed by the entityType discriminant instead.
export const activityLogSchema = z.object({
  id: z.string().uuid(),
  type: activityTypeSchema,
  entityType: activityEntityTypeSchema,
  entityId: z.string().uuid(),
  userId: userIdSchema,
  metadata: z.record(z.unknown()),
  createdAt: z.string().datetime(),
});
export type ActivityLog = z.infer<typeof activityLogSchema>;
