import { jest } from "@jest/globals";

/**
 * Logger Mock
 * Provides mock implementation for the logger utility
 */

// Create a global mock logger instance
const createMockLogger = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

// Global logger mock that will be reused
let globalMockLogger = createMockLogger();

export const mockLogger = globalMockLogger;

/**
 * Get the current mock logger instance
 */
export function getMockLogger() {
  return globalMockLogger;
}

/**
 * Reset logger mocks
 */
export function resetLoggerMocks() {
  Object.values(globalMockLogger).forEach(mock => mock.mockReset());
}

/**
 * Create fresh logger mocks
 */
export function createFreshLoggerMocks() {
  globalMockLogger = createMockLogger();
  return globalMockLogger;
}
