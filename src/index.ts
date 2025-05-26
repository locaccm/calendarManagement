import 'reflect-metadata';
import app from './app';
import { AppDataSource } from './data-source';

const PORT = process.env.PORT ?? 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      if (isDevelopment) {
        console.log(`Server running on port ${PORT}`);
      }
    });
  })
  .catch((error: Error) => {
    // Keep error logging even in production for critical database errors
    console.error('Database connection error:', error);
  });
