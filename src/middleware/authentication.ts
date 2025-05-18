import { Request, Response, NextFunction } from 'express';
import { AuthUser } from './authorization';

/**
 * Middleware d'authentification simple pour démo/test :
 * - Récupère le userId et le role dans les headers (X-User-Id, X-User-Role)
 * - En vrai prod, remplacer par décodage JWT ou session
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Pour démo/dev : on prend l'utilisateur depuis les headers
  const userId = req.header('X-User-Id');
  const userRole = req.header('X-User-Role');
  if (!userId || !userRole) {
    return res.status(401).json({ error: 'Non authentifié (headers manquants)' });
  }
  req.user = {
    id: Number(userId),
    role: userRole as AuthUser['role'],
  };
  next();
}
