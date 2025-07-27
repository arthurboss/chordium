import { jest } from "@jest/globals";

/**
 * Logger Mock
 * Provides mock implementation for the logger utility
 */

/**
 * Interface for mock logger
 */
interface MockLogger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: any;
}

/**
 * Create a global mock logger instance
 */
const createMockLogger = (): MockLogger => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

// Global logger mock that will be reused
let globalMockLogger: MockLogger = createMockLogger();

export const mockLogger = globalMockLogger;

/**
 * Get the current mock logger instance
 */
export function getMockLogger(): MockLogger {
  return globalMockLogger;
}

/**
 * Reset logger mocks
 */
export function resetLoggerMocks(): void {
  Object.values(globalMockLogger).forEach(mock => mock.mockReset());
}

/**
 * Create fresh logger mocks
 */
export function createFreshLoggerMocks(): MockLogger {
  globalMockLogger = createMockLogger();
  return globalMockLogger;
}
