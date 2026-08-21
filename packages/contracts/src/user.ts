import { z } from 'zod';
import { userIdSchema } from './ids';

export const userSchema = z.object({
  id: userIdSchema,
  email: z.string().email(),
  name: z.string().min(1).max(120),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
});
export type User = z.infer<typeof userSchema>;

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;
