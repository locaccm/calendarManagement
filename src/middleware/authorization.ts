import { Request, Response, NextFunction } from 'express';

// Types de rôles possibles
export type UserRole = 'Owner' | 'Tenant';

// Interface utilisateur typique (adapter selon ton projet)
export interface AuthUser {
  id: number;
  role: UserRole;
}

// Middleware d'autorisation générique
export function authorize(roles: UserRole[] = [], ownOnly = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Accès refusé (rôle)' });
    }
    // Si ownOnly, on vérifie que l'utilisateur est bien le créateur de la ressource
    if (ownOnly && req.event && req.event.USEN_ID !== user.id) {
      return res.status(403).json({ error: 'Accès refusé (propriétaire)' });
    }
    next();
  };
}

// Pour que req.user soit typé partout (à placer dans un fichier de types globaux si besoin)
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      event?: any; // Pour les vérifications ownOnly, à enrichir selon ton modèle
    }
  }
}
