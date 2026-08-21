import type { Request, Response, NextFunction } from 'express';
import { verifyAuthToken } from '../lib/jwt';
import { AUTH_COOKIE_NAME } from '../lib/cookies';
import type { UserId } from '@teamflow/contracts';

declare global {
  // Augmenting Express's own ambient namespace is the documented way to type req.userId;
  // there's no ES module equivalent for extending a third-party global namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: UserId;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof token !== 'string') {
    res.status(401).json({ ok: false, error: { message: 'Unauthenticated' } });
    return;
  }
  try {
    const payload = verifyAuthToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ ok: false, error: { message: 'Invalid or expired session' } });
  }
}
