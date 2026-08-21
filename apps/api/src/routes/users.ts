import { Router } from 'express';
import { db } from '../db/client';
import { users } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { toUserDto } from '../lib/mappers';

export const usersRouter = Router();

usersRouter.get('/users', requireAuth, async (_req, res) => {
  const rows = await db.select().from(users);
  res.json({ ok: true, data: rows.map(toUserDto) });
});
