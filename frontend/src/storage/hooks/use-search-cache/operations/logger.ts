/**
 * Provides consistent logging for cache operations
 */
export const logger = {
  warn: (message: string, context?: Record<string, unknown>) => {
    if (import.meta.env.DEV) {
      console.warn(`[useSearchCache] ${message}`, context);
    }
  },
  error: (message: string, context?: Record<string, unknown>) => {
    if (import.meta.env.DEV) {
      console.error(`[useSearchCache] ${message}`, context);
    }
  },
  info: (message: string, context?: Record<string, unknown>) => {
    if (import.meta.env.DEV) {
      console.info(`[useSearchCache] ${message}`, context);
    }
  },
};
