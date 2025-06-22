import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateCacheKey } from '@/cache/core/cache-key-generator';
import { initializeCache } from '@/cache/core/cache-initializer';

describe('Debug Cache Core', () => {
  let localStorageMock: any;

  beforeEach(() => {
    // Create a proper localStorage mock
    const store: Record<string, string> = {};
    localStorageMock = {
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
    };
    
    // Replace the global localStorage
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  it('should test cache key generation', () => {
    const key = generateCacheKey('Oasis', 'Wonderwall');
    console.log('Generated key:', key);
    expect(key).toBe('oasis-wonderwall');
  });

  it('should test cache initialization', () => {
    const cache = initializeCache('test-cache');
    console.log('Initialized cache:', cache);
    expect(cache).toHaveProperty('items');
    expect(Array.isArray(cache.items)).toBe(true);
    expect(cache.items).toHaveLength(0);
  });

  it('should save and retrieve from localStorage', () => {
    const testData = {
      items: [{
        key: 'test-key',
        data: { test: 'data' },
        timestamp: Date.now(),
        accessCount: 1
      }]
    };
    
    localStorage.setItem('test-cache', JSON.stringify(testData));
    console.log('Saved to localStorage:', localStorage.getItem('test-cache'));
    
    const retrieved = initializeCache('test-cache');
    console.log('Retrieved from cache:', retrieved);
    
    expect(retrieved.items).toHaveLength(1);
    expect(retrieved.items[0]).toHaveProperty('key', 'test-key');
  });

  it('should manually test addToMySongs logic', () => {
    // Manual implementation to debug
    const MY_SONGS_CACHE_KEY = 'mySongs';
    const cacheKey = generateCacheKey('Oasis', 'Wonderwall');
    console.log('Cache key:', cacheKey);
    
    const cache = initializeCache(MY_SONGS_CACHE_KEY);
    console.log('Initial cache:', cache);
    
    const testChordSheet = {
      title: 'Wonderwall',
      artist: 'Oasis',
      songChords: 'test content',
      songKey: 'G',
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      guitarCapo: 0
    };
    
    const newItem = {
      key: cacheKey,
      data: testChordSheet,
      timestamp: Date.now(),
      accessCount: 1,
    };
    
    const newItems = [newItem];
    console.log('New items:', newItems);
    
    const cacheToSave = { items: newItems };
    localStorage.setItem(MY_SONGS_CACHE_KEY, JSON.stringify(cacheToSave));
    console.log('Saved to localStorage:', localStorage.getItem(MY_SONGS_CACHE_KEY));
    
    const retrieved = initializeCache(MY_SONGS_CACHE_KEY);
    console.log('Retrieved after save:', retrieved);
    
    expect(retrieved.items).toHaveLength(1);
  });
});
