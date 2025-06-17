"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
// Middleware d'autorisation générique
function authorize(roles = [], ownOnly = false) {
    return (req, res, next) => {
        const user = req.user;
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
