import { vi } from 'vitest';

/**
 * Common test utilities for cache testing
 */

// Mock localStorage for tests
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: vi.fn(),
  };
};

// Setup global mocks
export const setupGlobalMocks = () => {
  const mockLocalStorage = createMockLocalStorage();
  
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
  
  global.fetch = vi.fn();
  
  return { mockLocalStorage };
};

// Common mock data
export const mockData = {
  searchResults: [
    { title: 'Gravity', url: '/john-mayer/gravity' },
    { title: 'Wonderland', url: '/john-mayer/wonderland' },
  ],
  
  artists: [
    { path: 'john-mayer', displayName: 'John Mayer', songCount: 15 },
    { path: 'taylor-swift', displayName: 'Taylor Swift', songCount: 25 },
  ],
  
  artistSongs: [
    { title: 'Gravity', path: '/gravity' },
    { title: 'Wonderland', path: '/wonderland' },
    { title: 'Slow Dancing in a Burning Room', path: '/slow-dancing' },
  ],
};

// Wait for async operations to complete
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
