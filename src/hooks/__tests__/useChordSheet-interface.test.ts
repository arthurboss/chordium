import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChordSheet } from '../useChordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

// Mock all the dependencies
vi.mock('../useChordSheet/cache-coordinator', () => ({
  CacheCoordinator: vi.fn().mockImplementation(() => ({
    clearExpiredCache: vi.fn(),
    getChordSheetData: vi.fn()
  }))
}));

vi.mock('@/utils/error-handlers', () => ({
  FetchErrorHandler: vi.fn().mockImplementation(() => ({
    handleError: vi.fn()
  }))
}));

describe('useChordSheet Hook - ChordSheet Interface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return ChordSheet data structure', async () => {
    const { result } = renderHook(() => useChordSheet());
    
    // The hook should return an object with ChordSheet properties
    expect(result.current).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        artist: expect.any(String),
        songChords: expect.any(String),
        songKey: expect.any(String),
        guitarTuning: expect.any(Array),
        guitarCapo: expect.any(Number)
      })
    );
  });

  it('should handle loading state properly', () => {
    const { result } = renderHook(() => useChordSheet());
    
    // Should have loading state initially
    expect(result.current).toEqual(
      expect.objectContaining({
        title: '',
        artist: '',
        songChords: '',
        songKey: '',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      })
    );
  });

  it('should return proper ChordSheet structure when data is loaded', async () => {
    const { result } = renderHook(() => useChordSheet('test-url'));
    
    await waitFor(() => {
      expect(result.current).toMatchObject({
        title: expect.any(String),
        artist: expect.any(String),
        songChords: expect.any(String),
        songKey: expect.any(String),
        guitarTuning: expect.any(Array),
        guitarCapo: expect.any(Number)
      });
    });
  });
});
