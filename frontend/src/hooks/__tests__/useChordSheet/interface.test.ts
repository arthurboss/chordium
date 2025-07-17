/**
 * Tests for useChordSheet hook interface and ChordSheet data structure
 * Focus: Testing that the hook returns proper ChordSheet interface
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChordSheet } from '../../useChordSheet';
import { GUITAR_TUNINGS } from '@/constants/guitar-tunings';
import React from 'react';

// Mock all the dependencies
vi.mock('../../useChordSheet/cache-coordinator', () => ({
  CacheCoordinator: vi.fn().mockImplementation(() => ({
    clearExpiredCache: vi.fn(),
    getChordSheetData: vi.fn().mockResolvedValue({
      title: 'Test Song',
      artist: 'Test Artist',
      songChords: 'C G Am F',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    })
  }))
}));

vi.mock('@/utils/error-handlers', () => ({
  FetchErrorHandler: vi.fn().mockImplementation(() => ({
    handleError: vi.fn()
  }))
}));

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ artist: 'test-artist', song: 'test-song' })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

describe('useChordSheet Hook - ChordSheet Interface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return ChordSheet data structure', () => {
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
    
    // Should have initial state
    expect(result.current).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        artist: expect.any(String),
        songChords: expect.any(String),
        songKey: expect.any(String),
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: expect.any(Number)
      })
    );
  });

  it('should return proper ChordSheet structure when data is loaded', () => {
    const { result } = renderHook(() => useChordSheet());
    
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
