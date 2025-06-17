"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEvent = loadEvent;
const prisma_1 = __importDefault(require("../prisma"));
/**
 * Middleware pour charger un événement par son ID et le placer dans req.event
 * Utilisé pour les routes qui manipulent un événement spécifique
 */
async function loadEvent(req, res, next) {
    const eventId = Number(req.params.id);
    if (!eventId) {
        return res.status(400).json({ error: "ID d'événement invalide" });
    }
    try {
        const event = await prisma_1.default.event.findUnique({ where: { EVEN_ID: eventId } });
        if (!event) {
            return res.status(404).json({ error: 'Événement non trouvé' });
        }
        req.event = event;
        next();
    }
    catch (err) {
        next(err);
    }
}
