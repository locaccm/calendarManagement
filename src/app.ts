import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import 'reflect-metadata';

// Loading environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
// Helmet configuration with a security policy adapted to the API
app.use(
  helmet({
    // CSP configuration with minimal but secure rules
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Allow WebSocket connections for development
        connectSrc: ["'self'", ...(process.env.NODE_ENV !== 'production' ? ['ws:'] : [])],
        // Allow inline scripts for Swagger UI in development
        scriptSrc: [
          "'self'",
          ...(process.env.NODE_ENV !== 'production' ? ["'unsafe-inline'"] : []),
        ],
        // Allow inline styles for Swagger UI
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    // Allow cross-origin resource sharing for the API
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// Basic Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Calendar Management API',
      version: '1.0.0',
      description: 'API for real estate calendar management',
    },
    components: {
      schemas: {
        Event: {
          type: 'object',
          properties: {
            evenId: { type: 'integer', description: 'Event ID (auto-incremented)' },
            evecLib: { type: 'string', description: 'Event label' },
            EVED_START: { type: 'string', format: 'date', description: 'Start date' },
            EVED_END: { type: 'string', format: 'date', description: 'End date' },
            USEN_ID: { type: 'integer', description: 'ID utilisateur (FK)' },
            ACCN_ID: { type: 'integer', description: 'ID logement (FK)' },
          },
          required: ['evecLib', 'EVED_START', 'EVED_END', 'USEN_ID', 'ACCN_ID'],
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
// Swagger only in development
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
// Import event routes
import eventRoutes from './routes/eventRoutes';

// Mount event routes
app.use('/', eventRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root route
app.get('/', (req, res) => {
  res.send('API Calendar Management');
});

export default app;
