/**
 * Environment-based logging utility to prevent memory leaks in tests
 * This utility checks if we're in a test environment and conditionally logs
 */

const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
const isVitestRunning = typeof process !== 'undefined' && process.env.VITEST === 'true';
const shouldLog = !isTestEnvironment && !isVitestRunning;

export const debugLog = (message: string, ...args: unknown[]) => {
  if (shouldLog) {
    console.log(message, ...args);
  }
};

export const debugError = (message: string, ...args: unknown[]) => {
  if (shouldLog) {
    console.error(message, ...args);
  }
};
