/**
 * Centralized Prisma mocking for tests
 * This file provides a consistent mock implementation of Prisma client
 * that can be used across all tests, especially in CI environment
 */

import { jest } from '@jest/globals';

// Mock event data
const mockEvent = {
  EVEN_ID: 1,
  EVEC_LIB: 'Test Event',
  EVED_START: new Date('2025-06-01T09:00:00Z'),
  EVED_END: new Date('2025-06-01T11:00:00Z'),
  USEN_ID: 1,
  ACCN_ID: 1,
  EVEC_DESCRIPTION: 'Test description',
  EVEC_COLOR: '#FF0000',
  EVEC_LOCATION: 'Test location',
  EVEC_STATUS: 'confirmed',
  EVEC_CREATED_AT: new Date(),
  EVEC_UPDATED_AT: new Date(),
};

// Mock user data
const mockUser = {
  USEN_ID: 1,
  USEC_LNAME: 'Test',
  USEC_FNAME: 'User',
  USEC_MAIL: 'testuser@example.com',
  USEC_PASSWORD: 'hash',
};

// Mock accommodation data
const mockAccommodation = {
  ACCN_ID: 1,
  ACCC_NAME: 'Test Accommodation',
  ACCC_ADDRESS: '1 Test Street',
  owner: { USEN_ID: 1 },
};

// Type pour les fonctions mock
type MockFunction = jest.Mock;

// Types pour les données mock
type MockEvent = typeof mockEvent;
type MockUser = typeof mockUser;
type MockAccommodation = typeof mockAccommodation;

// Interface pour le client Prisma mock
interface MockPrismaClient {
  event: {
    findUnique: MockFunction;
    findFirst: MockFunction;
    findMany: MockFunction;
    create: MockFunction;
    update: MockFunction;
    delete: MockFunction;
    deleteMany: MockFunction;
    count: MockFunction;
    upsert: MockFunction;
  };
  user: {
    findUnique: MockFunction;
    findFirst: MockFunction;
    findMany: MockFunction;
    create: MockFunction;
    update: MockFunction;
    delete: MockFunction;
    upsert: MockFunction;
  };
  accommodation: {
    findUnique: MockFunction;
    findFirst: MockFunction;
    findMany: MockFunction;
    create: MockFunction;
    update: MockFunction;
    delete: MockFunction;
    upsert: MockFunction;
  };
  $connect: MockFunction;
  $disconnect: MockFunction;
  $queryRaw: MockFunction;
  $transaction: MockFunction;
}

/**
 * Create a complete mock Prisma client
 * This includes all models and methods used in the application
 */
export const createMockPrismaClient = (): MockPrismaClient => {
  return {
    event: {
      findUnique: jest.fn().mockResolvedValue(mockEvent),
      findFirst: jest.fn().mockResolvedValue(mockEvent),
      findMany: jest.fn().mockResolvedValue([mockEvent]),
      create: jest.fn().mockResolvedValue(mockEvent),
      update: jest.fn().mockResolvedValue(mockEvent),
      delete: jest.fn().mockResolvedValue(mockEvent),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      count: jest.fn().mockResolvedValue(1),
      upsert: jest.fn().mockResolvedValue(mockEvent),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue(mockUser),
      findFirst: jest.fn().mockResolvedValue(mockUser),
      findMany: jest.fn().mockResolvedValue([mockUser]),
      create: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
      delete: jest.fn().mockResolvedValue(mockUser),
      upsert: jest.fn().mockResolvedValue(mockUser),
    },
    accommodation: {
      findUnique: jest.fn().mockResolvedValue(mockAccommodation),
      findFirst: jest.fn().mockResolvedValue(mockAccommodation),
      findMany: jest.fn().mockResolvedValue([mockAccommodation]),
      create: jest.fn().mockResolvedValue(mockAccommodation),
      update: jest.fn().mockResolvedValue(mockAccommodation),
      delete: jest.fn().mockResolvedValue(mockAccommodation),
      upsert: jest.fn().mockResolvedValue(mockAccommodation),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 'success' }]),
    $transaction: jest.fn().mockImplementation((callback: any) => {
      if (typeof callback === 'function') {
        return Promise.resolve(callback(createMockPrismaClient()));
      }
      // Si c'est un tableau de promesses
      if (Array.isArray(callback)) {
        return Promise.all(callback);
      }
      return Promise.resolve([]);
    }),
  };
};

/**
 * Setup Jest mocks for Prisma
 * This should be called before importing any modules that use Prisma
 */
export const setupPrismaMocks = (): MockPrismaClient => {
  const mockPrismaClient = createMockPrismaClient();

  jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
  }));

  jest.mock('../prisma', () => mockPrismaClient);

  return mockPrismaClient;
};

/**
 * Reset all Prisma mocks
 * This should be called after each test to ensure clean state
 */
export const resetPrismaMocks = (mockClient: MockPrismaClient): void => {
  Object.values(mockClient).forEach((model: any) => {
    if (model && typeof model === 'object') {
      Object.values(model).forEach((method: any) => {
        if (typeof method === 'function' && method.mockClear) {
          method.mockClear();
        }
      });
    }
  });
};
