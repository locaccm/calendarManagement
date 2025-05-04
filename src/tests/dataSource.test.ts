import { AppDataSource } from '../data-source';
import { Event } from '../models/Event';

describe('AppDataSource', () => {
  it('should be defined', () => {
    expect(AppDataSource).toBeDefined();
  });

  it('should include Event entity', () => {
    // @ts-ignore
    const entities = AppDataSource.options.entities;
    expect(entities).toContain(Event);
  });

  it('should use sqlite in test environment', () => {
    process.env.NODE_ENV = 'test';
    jest.resetModules();
    const { AppDataSource: TestDataSource } = require('../data-source');
    // @ts-ignore
    expect(TestDataSource.options.type).toBe('sqlite');
  });

  it('should use postgres in non-test environment', () => {
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const { AppDataSource: ProdDataSource } = require('../data-source');
    // @ts-ignore
    expect(ProdDataSource.options.type).toBe('postgres');
  });
});
