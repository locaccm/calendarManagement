"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
/**
 * Middleware d'authentification simple pour démo/test :
 * - Récupère le userId et le role dans les headers (X-User-Id, X-User-Role)
 * - En vrai prod, remplacer par décodage JWT ou session
 */
function authenticate(req, res, next) {
    // Pour démo/dev : on prend l'utilisateur depuis les headers
    const userId = req.header('X-User-Id');
    const userRole = req.header('X-User-Role');
    if (!userId || !userRole) {
        return res.status(401).json({ error: 'Non authentifié (headers manquants)' });
    }
    req.user = {
        id: Number(userId),
        role: userRole,
    };
    next();
}
