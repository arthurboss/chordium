import { describe, it, expect, beforeEach } from 'vitest';
import { generateCacheKey } from '../../implementations/search-cache';

// Mock localStorage to prevent any potential memory issues
const mockStorage = new Map<string, string>();
global.localStorage = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, value: string) => { mockStorage.set(key, value); },
  removeItem: (key: string) => { mockStorage.delete(key); },
  clear: () => { mockStorage.clear(); },
  length: mockStorage.size,
  key: (index: number) => Array.from(mockStorage.keys())[index] || null
} as Storage;

// Minimal test with controlled environment - test real functions
describe('Cache - Minimal', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('should generate cache keys', () => {
    const key1 = generateCacheKey('artist', null);
    const key2 = generateCacheKey('artist', null);
    expect(key1).toBe(key2);
    expect(key1).toBe('artist:artist|song:');
  });

  it('should normalize cache keys', () => {
    const key1 = generateCacheKey('  John Mayer  ', null);
    const key2 = generateCacheKey('john mayer', null);
    expect(key1).toBe(key2);
    expect(key1).toBe('artist:john mayer|song:');
  });

  it('should handle null values in cache keys', () => {
    const key = generateCacheKey(null, 'song');
    expect(key).toBe('artist:|song:song');
  });
});
