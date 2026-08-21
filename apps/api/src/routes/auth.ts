import { Router } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { loginRequestSchema, userSchema, type User, type UserId } from '@teamflow/contracts';
import { db } from '../db/client';
import { users } from '../db/schema';
import { signAuthToken } from '../lib/jwt';
import { setAuthCookie, clearAuthCookie } from '../lib/cookies';
import { AppError } from '../middleware/error-handler';
import { requireAuth } from '../middleware/auth';
import { toUserDto } from '../lib/mappers';

export const authRouter = Router();

authRouter.post('/auth/login', async (req, res) => {
  const body = loginRequestSchema.parse(req.body);
  const [row] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
  if (!row) throw new AppError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(body.password, row.passwordHash);
  if (!valid) throw new AppError(401, 'Invalid email or password');

  const token = signAuthToken(row.id as UserId);
  setAuthCookie(res, token);

  const user: User = userSchema.parse(toUserDto(row));
  res.json({ ok: true, data: user });
});

authRouter.post('/auth/logout', requireAuth, (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true, data: null });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const [row] = await db.select().from(users).where(eq(users.id, req.userId as UserId)).limit(1);
  if (!row) throw new AppError(401, 'Unauthenticated');
  const user: User = userSchema.parse(toUserDto(row));
  res.json({ ok: true, data: user });
});
