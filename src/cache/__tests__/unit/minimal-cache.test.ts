import { describe, it, expect, beforeEach } from 'vitest';
import { generateUnifiedCacheKey } from '@/storage/utils/unified-cache-key-generator';

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

  it('should generate unified cache keys', () => {
    const key1 = generateUnifiedCacheKey('Artist', 'Song');
    const key2 = generateUnifiedCacheKey('Artist', 'Song');
    expect(key1).toBe(key2);
    expect(key1).toBe('artist-song');
  });

  it('should normalize unified cache keys', () => {
    const key1 = generateUnifiedCacheKey('  John Mayer  ', 'Gravity  ');
    const key2 = generateUnifiedCacheKey('john mayer', 'gravity');
    expect(key1).toBe(key2);
    expect(key1).toBe('john_mayer-gravity');
  });

  it('should handle invalid values in cache keys', () => {
    const key1 = generateUnifiedCacheKey('', 'song');
    const key2 = generateUnifiedCacheKey('artist', '');
    expect(key1).toBe('');
    expect(key2).toBe('');
  });
});
