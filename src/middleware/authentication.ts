import { Request, Response, NextFunction } from 'express';
import { AuthUser } from './authorization';

/**
 * Simple authentication middleware for demo/test:
 * - Gets userId and role from headers (X-User-Id, X-User-Role)
 * - In real production, replace with JWT decoding or session
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // For demo/dev: get user from headers
  const userId = req.header('X-User-Id');
  const userRole = req.header('X-User-Role');
  if (!userId || !userRole) {
    return res.status(401).json({ error: 'Not authenticated (missing headers)' });
  }
  req.user = {
    id: Number(userId),
    role: userRole as AuthUser['role'],
  };
  next();
}
