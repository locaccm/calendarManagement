import { Request, Response, NextFunction } from 'express';

// Possible role types
export type UserRole = 'Owner' | 'Tenant';

// Interface utilisateur typique (adapter selon ton projet)
export interface AuthUser {
  id: number;
  role: UserRole;
}

// Generic authorization middleware
export function authorize(roles: UserRole[] = [], ownOnly = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied (role)' });
    }
    // If ownOnly, verify that the user is the creator of the resource
    if (ownOnly && req.event && req.event.USEN_ID !== user.id) {
      return res.status(403).json({ error: 'Access denied (owner)' });
    }
    next();
  };
}

// To type req.user everywhere (to be placed in a global types file if needed)
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      event?: any; // For ownOnly checks, to be enriched according to your model
    }
  }
}
