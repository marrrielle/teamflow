import { z } from 'zod';
import { taskIdSchema, projectIdSchema, userIdSchema } from './ids';

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'done']);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const taskSchema = z.object({
  id: taskIdSchema,
  projectId: projectIdSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullable(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  assigneeId: userIdSchema.nullable(),
  dueDate: z.string().datetime().nullable(),
  position: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Task = z.infer<typeof taskSchema>;

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullable().optional(),
  priority: taskPrioritySchema.default('medium'),
  assigneeId: userIdSchema.nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});
export type CreateTaskRequest = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: userIdSchema.nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  position: z.number().optional(),
});
export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>;

export const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: userIdSchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'position']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
