// Dynamically load the correct .env file based on NODE_ENV
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';
let envFile = '.env';

if (env === 'test') {
  if (fs.existsSync(path.resolve(process.cwd(), '.env.test'))) {
    envFile = '.env.test';
  }
} else if (env === 'development') {
  if (fs.existsSync(path.resolve(process.cwd(), '.env.developpement'))) {
    envFile = '.env.developpement';
  }
}
// else: default to .env (for production or fallback)

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export default envFile;
