import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import "reflect-metadata";

// Chargement des variables d'environnement
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Swagger configuration de base
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Calendar Management API',
      version: '1.0.0',
      description: 'API pour la gestion d\'agenda immobilier',
    },
  },
  apis: ['./src/routes/*.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes placeholder
app.get('/', (req, res) => {
  res.send('API Calendar Management');
});

export default app;
