import { z } from 'zod';

export const userIdSchema = z.string().uuid().brand<'UserId'>();
export type UserId = z.infer<typeof userIdSchema>;

export const projectIdSchema = z.string().uuid().brand<'ProjectId'>();
export type ProjectId = z.infer<typeof projectIdSchema>;

export const taskIdSchema = z.string().uuid().brand<'TaskId'>();
export type TaskId = z.infer<typeof taskIdSchema>;
