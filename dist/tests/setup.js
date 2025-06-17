"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.resetDatabase = resetDatabase;
exports.closeDatabase = closeDatabase;
exports.initTestDatabase = initTestDatabase;
const client_1 = require("@prisma/client");
const testcontainers_1 = require("testcontainers");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const execPromise = (0, util_1.promisify)(child_process_1.exec);
let container;
let prisma;
// Charger les variables d'environnement de test
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env.test') });
// Configuration du conteneur PostgreSQL pour les tests
async function setupTestDatabase() {
    // Démarrer un conteneur PostgreSQL pour les tests
    container = await new testcontainers_1.GenericContainer('postgres:14')
        .withEnvironment({
        POSTGRES_DB: 'calendar_test_db',
        POSTGRES_USER: 'postgres',
        POSTGRES_PASSWORD: 'postgres',
    })
        .withExposedPorts(5432)
        .start();
    // Configurer l'URL de connexion pour Prisma
    const host = container.getHost();
    const port = container.getMappedPort(5432);
    process.env.DATABASE_URL = `postgresql://postgres:postgres@${host}:${port}/calendar_test_db?schema=public`;
    // Créer une nouvelle instance de PrismaClient
    exports.prisma = prisma = new client_1.PrismaClient();
    // Exécuter les migrations Prisma
    try {
        await execPromise('npx prisma migrate deploy');
        console.log('Migrations appliquées avec succès');
    }
    catch (error) {
        console.error("Erreur lors de l'application des migrations:", error);
    }
    return prisma;
}
// Fonction pour réinitialiser la base de données de test avant chaque suite de tests
async function resetDatabase() {
    try {
        // Supprimer toutes les données existantes
        await prisma.event.deleteMany({});
        console.log('Base de données de test réinitialisée avec succès');
    }
    catch (error) {
        console.error('Erreur lors de la réinitialisation de la base de données de test:', error);
        throw error;
    }
}
// Fonction pour fermer la connexion à la base de données après les tests
async function closeDatabase() {
    await prisma.$disconnect();
    if (container) {
        await container.stop();
        console.log('Conteneur de test arrêté');
    }
}
// Initialisation de la base de données de test
async function initTestDatabase() {
    if (!prisma) {
        await setupTestDatabase();
    }
    return prisma;
}
