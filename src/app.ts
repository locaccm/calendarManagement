import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import 'reflect-metadata';
import path from 'path';
import eventRoutes from './routes/eventRoutes';

// Chargement des variables d'environnement
dotenv.config();

const app = express();
app.use(express.json());

// Configuration CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Security configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// Simplified Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.API_TITLE || 'API de Gestion de Calendrier',
      version: process.env.API_VERSION || '1.0.0',
      description: "API pour la gestion d'agenda immobilier",
      contact: {
        name: 'Support',
        email: 'support@calendarmanagement.com',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Serveur principal',
      },
    ],
    components: {},
  },
  apis: ['./src/routes/*.ts'],
};

// Generate Swagger documentation
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Options UI pour Swagger
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { background-color: #4CAF50; }
    .swagger-ui .info .title { color: #4CAF50; }
  `,
  swaggerOptions: {
    syntaxHighlight: { theme: 'monokai' },
  },
};

// Montage de la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Middleware to redirect to API documentation
app.use('/api-docs-fr', (req, res) => {
  res.redirect('/api-docs');
});

// Page d'accueil qui redirige vers la documentation Swagger
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${process.env.API_TITLE || 'API de Gestion de Calendrier'}</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .logo {
            font-size: 3rem;
            font-weight: 700;
            color: #4CAF50;
            margin-bottom: 10px;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
          }
          p {
            font-size: 1.2rem;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto 30px;
            padding: 20px;
            text-align: center;
          }
          .btn {
            background-color: #4CAF50;
            border: 2px solid #4CAF50;
            color: white;
            padding: 15px 40px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 18px;
            font-weight: 500;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .btn:hover {
            background-color: #3b9c3b;
            border-color: #3b9c3b;
          }
          .info {
            margin-top: 30px;
            color: #666;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🗓️</div>
            <h1>${process.env.API_TITLE || 'API de Gestion de Calendrier'}</h1>
            <p>Welcome to the Calendar Management API. This API allows you to manage events, reservations, and availability for accommodations.</p>
          </div>
          <div>
            <a href="/api-docs" class="btn">Access API Documentation</a>
          </div>
          <div class="info">
            <p>Version: ${process.env.API_VERSION || '1.0.0'}</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Mount event routes
app.use('/', eventRoutes);

// Route health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
