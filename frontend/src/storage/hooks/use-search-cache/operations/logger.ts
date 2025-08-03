/**
 * Provides consistent logging for cache operations
 */
export const logger = {
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(`[useSearchCache] ${message}`, context);
  },
  error: (message: string, context?: Record<string, unknown>) => {
    console.error(`[useSearchCache] ${message}`, context);
  },
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(`[useSearchCache] ${message}`, context);
  },
};
