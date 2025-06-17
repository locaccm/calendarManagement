"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./prisma"));
const PORT = process.env.PORT || 3000;
async function startServer() {
    try {
        // Prisma est automatiquement connecté lors de l'importation
        app_1.default.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Erreur lors du démarrage du serveur:', error);
        await prisma_1.default.$disconnect();
        process.exit(1);
    }
}
startServer();
