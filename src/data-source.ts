import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Event } from './models/Event';
import dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'calendar_db',
  synchronize: true, // à désactiver en prod
  logging: false,
  entities: [Event],
  migrations: [],
  subscribers: [],
});
