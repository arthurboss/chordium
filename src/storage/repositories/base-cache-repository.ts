/**
 * Base interface for all IndexedDB cache repositories
 * Follows SRP: Single responsibility for cache repository contract
 */
export interface BaseCacheRepository<T> {
  initialize(): Promise<void>;
  close(): Promise<void>;
  store(key: string, data: T, metadata?: Record<string, unknown>): Promise<void>;
  get(key: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  removeExpired(): Promise<number>;
}
