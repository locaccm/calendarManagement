import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Event } from './models/Event';
import dotenv from 'dotenv';
dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource(
  isTest
    ? {
        type: 'sqlite',
        database: ':memory:',
        dropSchema: true,
        entities: [Event],
        synchronize: true,
        logging: false,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432'),
        username: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_NAME ?? 'calendar_db',
        entities: [Event],
        synchronize: true,
        logging: false,
      },
);
