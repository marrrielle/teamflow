import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ ok: false, error: { message: 'Validation failed', issues: err.issues } });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.status).json({ ok: false, error: { message: err.message } });
    return;
  }
  console.error(err);
  res.status(500).json({ ok: false, error: { message: 'Internal server error' } });
}
