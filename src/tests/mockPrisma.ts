/**
 * Centralized Prisma mocking for tests
 * This file provides a consistent mock implementation of Prisma client
 * that can be used across all tests, especially in CI environment
 */

import { jest } from '@jest/globals';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Mock data for tests with types that match Prisma schema
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

// Ensure mockUser has all required fields from Prisma schema
const mockUser = {
  USEN_ID: 1,
  USEC_URLPP: null,
  USEC_LNAME: 'Test',
  USEC_FNAME: 'User',
  USEC_TYPE: null,
  USEC_BIO: null,
  USED_BIRTH: null,
  USEC_MAIL: 'testuser@example.com',
  USEC_PASSWORD: 'hash',
  USEC_PHONE: null,
  USEC_TEL: null, // Missing field
  USEC_ADDRESS: null, // Missing field
  USEC_CREATED_AT: new Date(),
  USEC_UPDATED_AT: new Date(),
  USEN_INVITE: null,
};

// Ensure mockAccommodation has all required fields from Prisma schema
const mockAccommodation = {
  USEN_ID: 1,
  ACCN_ID: 1,
  ACCC_NAME: 'Test Accommodation',
  ACCC_TYPE: null,
  ACCC_DESC: null,
  ACCC_ADDRESS: '1 Test Street',
  ACCB_AVAILABLE: null,
};

// Type for the mock Prisma client
export type MockPrismaClient = DeepMockProxy<PrismaClient>;

// Create a singleton instance of the mock client
const prisma = mockDeep<PrismaClient>();

/**
 * Configure default mock values for the Prisma client
 * This sets up common return values for Prisma methods
 */
export const configureMockDefaults = (mockClient: MockPrismaClient): void => {
  // Event model mocks
  mockClient.event.findUnique.mockResolvedValue(mockEvent);
  mockClient.event.findFirst.mockResolvedValue(mockEvent);
  mockClient.event.findMany.mockResolvedValue([mockEvent]);
  mockClient.event.create.mockResolvedValue(mockEvent);
  mockClient.event.update.mockResolvedValue(mockEvent);
  mockClient.event.delete.mockResolvedValue(mockEvent);
  mockClient.event.deleteMany.mockResolvedValue({ count: 1 });
  mockClient.event.count.mockResolvedValue(1);
  mockClient.event.upsert.mockResolvedValue(mockEvent);

  // User model mocks
  mockClient.user.findUnique.mockResolvedValue(mockUser);
  mockClient.user.findFirst.mockResolvedValue(mockUser);
  mockClient.user.findMany.mockResolvedValue([mockUser]);
  mockClient.user.create.mockResolvedValue(mockUser);
  mockClient.user.update.mockResolvedValue(mockUser);
  mockClient.user.delete.mockResolvedValue(mockUser);
  mockClient.user.upsert.mockResolvedValue(mockUser);

  // Accommodation model mocks
  mockClient.accommodation.findUnique.mockResolvedValue(mockAccommodation);
  mockClient.accommodation.findFirst.mockResolvedValue(mockAccommodation);
  mockClient.accommodation.findMany.mockResolvedValue([mockAccommodation]);
  mockClient.accommodation.create.mockResolvedValue(mockAccommodation);
  mockClient.accommodation.update.mockResolvedValue(mockAccommodation);
  mockClient.accommodation.delete.mockResolvedValue(mockAccommodation);
  mockClient.accommodation.upsert.mockResolvedValue(mockAccommodation);

  // Global Prisma methods
  mockClient.$connect.mockResolvedValue();
  mockClient.$disconnect.mockResolvedValue();
  mockClient.$queryRaw.mockResolvedValue([{ result: 'success' }]);
  mockClient.$transaction.mockImplementation((callback) => {
    if (typeof callback === 'function') {
      return Promise.resolve(callback(mockClient));
    }
    if (Array.isArray(callback)) {
      return Promise.all(callback);
    }
    return Promise.resolve([]);
  });
};

/**
 * Get the mock Prisma client instance
 * This returns the singleton mock client with default configurations
 */
export const getMockPrismaClient = (): MockPrismaClient => {
  configureMockDefaults(prisma);
  return prisma;
};

/**
 * Setup Jest mocks for Prisma
 * This should be called before importing any modules that use Prisma
 */
export const setupPrismaMocks = (): MockPrismaClient => {
  const mockPrismaClient = getMockPrismaClient();

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
  mockReset(mockClient);
  configureMockDefaults(mockClient);
};
