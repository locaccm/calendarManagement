"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Chargement des variables d'environnement en fonction de NODE_ENV
const env = process.env.NODE_ENV || 'development';
switch (env) {
    case 'test':
        dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env.test') });
        break;
    case 'development':
        dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env.development') });
        break;
    default:
        // Production ou autre
        dotenv_1.default.config();
}
// Configuration du client Prisma avec logging en développement uniquement
const prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
exports.default = prisma;
