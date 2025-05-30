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
// Enable Content Security Policy for better security. Adjust directives as needed for your frontend.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Add other directives (scriptSrc, imgSrc, etc.) as needed for your frontend
      },
    },
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
            EVEN_ID: { type: 'integer', description: 'Event ID (auto-incremented)' },
            EVEC_LIB: { type: 'string', description: 'Event label' },
            EVED_START: { type: 'string', format: 'date', description: 'Start date' },
            EVED_END: { type: 'string', format: 'date', description: 'End date' },
            USEN_ID: { type: 'integer', description: 'User ID (FK)' },
            ACCN_ID: { type: 'integer', description: 'Accommodation ID (FK)' },
          },
          required: ['EVEC_LIB', 'EVED_START', 'EVED_END', 'USEN_ID', 'ACCN_ID'],
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
