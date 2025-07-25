import { jest, beforeEach, afterEach } from '@jest/globals';

/**
 * Shared setup utilities for logger tests
 */

export interface ConsoleSpy {
  log: jest.SpiedFunction<typeof console.log>;
  error: jest.SpiedFunction<typeof console.error>;
  warn: jest.SpiedFunction<typeof console.warn>;
  debug: jest.SpiedFunction<typeof console.debug>;
}

export interface LoggerTestContext {
  consoleSpy: ConsoleSpy;
  originalNodeEnv: string | undefined;
}

/**
 * Sets up console spies and environment for logger tests
 */
export const setupLoggerTest = (): LoggerTestContext => {
  const originalNodeEnv = process.env.NODE_ENV;
  
  // Create spies for all console methods
  const consoleSpy: ConsoleSpy = {
    log: jest.spyOn(console, 'log').mockImplementation(() => {}),
    error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
    debug: jest.spyOn(console, 'debug').mockImplementation(() => {})
  };

  return { consoleSpy, originalNodeEnv };
};

/**
 * Cleans up console spies and restores environment
 */
export const cleanupLoggerTest = (context: LoggerTestContext): void => {
  // Restore all spies
  Object.values(context.consoleSpy).forEach(spy => spy.mockRestore());
  process.env.NODE_ENV = context.originalNodeEnv;
};

/**
 * Sets up beforeEach and afterEach hooks for logger tests
 */
export const useLoggerTestSetup = () => {
  let testContext: LoggerTestContext;

  beforeEach(() => {
    testContext = setupLoggerTest();
  });

  afterEach(() => {
    cleanupLoggerTest(testContext);
  });

  return () => testContext;
};
