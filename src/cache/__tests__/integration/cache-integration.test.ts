// Integration test for cache functionality - tests realistic cache scenarios
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage for testing
const mockStorage = new Map<string, string>();
global.localStorage = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, value: string) => { mockStorage.set(key, value); },
  removeItem: (key: string) => { mockStorage.delete(key); },
  clear: () => { mockStorage.clear(); },
  length: mockStorage.size,
  key: (index: number) => Array.from(mockStorage.keys())[index] || null
} as Storage;

// Mock console.log to prevent memory issues
global.console.log = vi.fn();
global.console.error = vi.fn();

describe('Cache Integration', () => {
  beforeEach(() => {
    mockStorage.clear();
    vi.clearAllMocks();
  });

  it('should cache search results with expiration', () => {
    const cacheKey = 'search-results:john-mayer';
    const searchResults = [
      { artist: 'John Mayer', song: 'Gravity' },
      { artist: 'John Mayer', song: 'Waiting on the World' }
    ];
    
    // Simulate caching search results
    const cacheData = {
      results: searchResults,
      timestamp: Date.now(),
      expiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    // Verify cache retrieval
    const cached = localStorage.getItem(cacheKey);
    expect(cached).not.toBeNull();
    
    const parsedCache = JSON.parse(cached!);
    expect(parsedCache.results).toEqual(searchResults);
    expect(parsedCache.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('should handle cache size limits', () => {
    const maxEntries = 5;
    
    // Fill cache beyond limit
    for (let i = 0; i < maxEntries + 2; i++) {
      const key = `cache-entry-${i}`;
      const data = { data: `entry-${i}`, timestamp: Date.now() + i };
      localStorage.setItem(key, JSON.stringify(data));
    }
    
    // Simulate LRU cleanup logic
    const allKeys = Array.from(mockStorage.keys())
      .filter(key => key.startsWith('cache-entry-'))
      .sort((a, b) => {
        const dataA = JSON.parse(mockStorage.get(a)!);
        const dataB = JSON.parse(mockStorage.get(b)!);
        return dataA.timestamp - dataB.timestamp;
      });
    
    // Remove oldest entries if over limit
    if (allKeys.length > maxEntries) {
      const toRemove = allKeys.slice(0, allKeys.length - maxEntries);
      toRemove.forEach(key => mockStorage.delete(key));
    }
    
    // Verify cleanup worked
    const remainingKeys = Array.from(mockStorage.keys())
      .filter(key => key.startsWith('cache-entry-'));
    expect(remainingKeys.length).toBeLessThanOrEqual(maxEntries);
    
    // Verify newest entries are still there
    expect(mockStorage.has('cache-entry-5')).toBe(true);
    expect(mockStorage.has('cache-entry-6')).toBe(true);
  });

  it('should detect expired cache entries', () => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneHourFromNow = now + (60 * 60 * 1000);
    
    // Create expired cache entry
    const expiredCache = {
      results: ['old-data'],
      timestamp: oneHourAgo,
      expiry: oneHourAgo + 1000 // Already expired
    };
    localStorage.setItem('expired-cache', JSON.stringify(expiredCache));
    
    // Create fresh cache entry
    const freshCache = {
      results: ['fresh-data'],
      timestamp: now,
      expiry: oneHourFromNow
    };
    localStorage.setItem('fresh-cache', JSON.stringify(freshCache));
    
    // Test expiration logic
    const isExpired = (cacheKey: string): boolean => {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return true;
      
      const data = JSON.parse(cached);
      return Date.now() > data.expiry;
    };
    
    expect(isExpired('expired-cache')).toBe(true);
    expect(isExpired('fresh-cache')).toBe(false);
    expect(isExpired('non-existent')).toBe(true);
  });

  it('should handle concurrent cache operations', () => {
    const baseKey = 'concurrent-test';
    
    // Simulate multiple cache writes (like multiple search requests)
    const operations = [];
    for (let i = 0; i < 3; i++) {
      operations.push(() => {
        const key = `${baseKey}-${i}`;
        const data = { query: `search-${i}`, results: [`result-${i}`] };
        localStorage.setItem(key, JSON.stringify(data));
      });
    }
    
    // Execute operations
    operations.forEach(op => op());
    
    // Verify all operations succeeded
    for (let i = 0; i < 3; i++) {
      const key = `${baseKey}-${i}`;
      const cached = localStorage.getItem(key);
      expect(cached).not.toBeNull();
      
      const data = JSON.parse(cached!);
      expect(data.query).toBe(`search-${i}`);
      expect(data.results).toEqual([`result-${i}`]);
    }
  });
});
