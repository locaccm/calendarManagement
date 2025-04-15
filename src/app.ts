import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import 'reflect-metadata';

// Chargement des variables d'environnement
dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(
  helmet({
    contentSecurityPolicy: false, // à adapter selon le frontend
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// Swagger configuration de base
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Calendar Management API',
      version: '1.0.0',
      description: "API pour la gestion d'agenda immobilier",
    },
    components: {
      schemas: {
        Event: {
          type: 'object',
          properties: {
            EVEN_ID: { type: 'integer', description: "ID de l'événement (auto-incrémenté)" },
            EVEC_LIB: { type: 'string', description: "Libellé de l'événement" },
            EVED_START: { type: 'string', format: 'date', description: 'Date de début' },
            EVED_END: { type: 'string', format: 'date', description: 'Date de fin' },
            USEN_ID: { type: 'integer', description: 'ID utilisateur (FK)' },
            ACCN_ID: { type: 'integer', description: 'ID logement (FK)' },
          },
          required: ['EVEC_LIB', 'EVED_START', 'EVED_END', 'USEN_ID', 'ACCN_ID'],
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
// Swagger uniquement en développement
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Routes placeholder
app.get('/', (req, res) => {
  res.send('API Calendar Management');
});

export default app;
