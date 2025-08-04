import { vi } from 'vitest';
import type { Artist } from '@chordium/types';

/**
 * Shared test utilities for useSearchCache tests
 */

/**
 * Mock console setup for tests
 */
export function setupMockConsole() {
  const mockConsole = {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  };
  vi.stubGlobal('console', mockConsole);
  return mockConsole;
}

/**
 * Create a mock cache entry for testing
 */
export function createMockCacheEntry(overrides: Record<string, unknown> = {}) {
  return {
    path: 'artists/search',
    results: [{ path: 'artist/beatles', displayName: 'The Beatles', songCount: 10 }] as Artist[],
    search: {
      query: { artist: 'Beatles', song: null },
      searchType: 'artist' as const,
      dataSource: 'cifraclub' as const,
    },
    storage: {
      timestamp: Date.now(),
      version: 1,
      expiresAt: Date.now() + 300000,
    },
    ...overrides,
  };
}
