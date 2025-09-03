// Test file for session storage utilities
import { describe, it, test, expect, beforeEach, vi } from 'vitest';
import { storeChordUrl, getChordUrl } from './session-storage-utils';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('Session Storage Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock sessionStorage state
    mockSessionStorage.getItem.mockReturnValue(null);
    mockSessionStorage.setItem.mockClear();
    mockSessionStorage.removeItem.mockClear();
    mockSessionStorage.length = 0;
    mockSessionStorage.key.mockReturnValue(null);
  });
  
  test('should store and retrieve chord URLs', () => {
    const artistSlug = 'test-artist';
    const songSlug = 'test-song';
    const url = 'https://example.com/test-artist/test-song';
    
    // Mock successful storage
    mockSessionStorage.setItem.mockImplementation((key, value) => {
      if (key === 'chord-url-test-artist-test-song') {
        mockSessionStorage.getItem.mockReturnValue(value);
      }
    });
    
    storeChordUrl(artistSlug, songSlug, url);
    
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('chord-url-test-artist-test-song', url);
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('chord-url-test-artist-test-song-timestamp', expect.any(String));
    
    // Test retrieval
    const retrievedUrl = getChordUrl(artistSlug, songSlug);
    expect(retrievedUrl).toBe(url);
  });
  
  test('should clean up old entries when limit is reached', () => {
    const limit = 20; // This should match MAX_CHORD_URLS in the implementation
    
    // Mock sessionStorage to simulate having many entries
    const mockKeys = [];
    for (let i = 0; i < limit + 5; i++) {
      mockKeys.push(`chord-url-artist-${i}-song-${i}`);
      mockKeys.push(`chord-url-artist-${i}-song-${i}-timestamp`);
    }
    
    // Mock the Object.keys behavior for sessionStorage
    const originalKeys = Object.keys;
    Object.keys = vi.fn().mockReturnValue(mockKeys);
    
    // Mock sessionStorage.length and key behavior
    mockSessionStorage.length = mockKeys.length;
    mockSessionStorage.key.mockImplementation((index) => mockKeys[index]);
    
    // Mock getItem to return timestamps for sorting
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key.endsWith('-timestamp')) {
        const index = parseInt(key.match(/artist-(\d+)/)?.[1] || '0');
        return (index * 1000).toString(); // Older entries have lower timestamps
      }
      return 'https://example.com/test';
    });
    
    // Store a new URL which should trigger cleanup
    storeChordUrl('new-artist', 'new-song', 'https://example.com/new-artist/new-song');
    
    // Verify that cleanup was attempted
    expect(mockSessionStorage.removeItem).toHaveBeenCalled();
    
    // Restore original Object.keys
    Object.keys = originalKeys;
  });
});
