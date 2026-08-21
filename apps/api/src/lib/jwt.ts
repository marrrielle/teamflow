import jwt from 'jsonwebtoken';
import { env } from './env';
import type { UserId } from '@teamflow/contracts';

export interface AuthTokenPayload {
  sub: UserId;
}

const EXPIRES_IN = '7d';

export function signAuthToken(userId: UserId): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}
