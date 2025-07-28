/**
 * Tests for storage module
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storeSampleSongs } from '../storage';
import { createMockChordSheetService, createMockChordSheet } from './test-utils';

describe('Sample Storage', () => {
  let mockChordSheetService: ReturnType<typeof createMockChordSheetService>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockChordSheetService = createMockChordSheetService();
  });

  it('should store samples with correct metadata', async () => {
    const mockChordSheet = createMockChordSheet();
    const samples = [mockChordSheet];
    
    await storeSampleSongs(samples, mockChordSheetService);
    
    expect(mockChordSheetService.store).toHaveBeenCalledWith(
      mockChordSheet.artist,
      mockChordSheet.title,
      mockChordSheet,
      { saved: true, source: 'sample-dev' }
    );
  });

  it('should store multiple samples', async () => {
    const samples = [
      createMockChordSheet({ title: 'Song 1', artist: 'Artist 1' }),
      createMockChordSheet({ title: 'Song 2', artist: 'Artist 2' })
    ];
    
    await storeSampleSongs(samples, mockChordSheetService);
    
    expect(mockChordSheetService.store).toHaveBeenCalledTimes(2);
    expect(mockChordSheetService.store).toHaveBeenNthCalledWith(
      1,
      'Artist 1',
      'Song 1',
      samples[0],
      { saved: true, source: 'sample-dev' }
    );
    expect(mockChordSheetService.store).toHaveBeenNthCalledWith(
      2,
      'Artist 2',
      'Song 2',
      samples[1],
      { saved: true, source: 'sample-dev' }
    );
  });

  it('should handle empty samples array', async () => {
    await storeSampleSongs([], mockChordSheetService);
    
    expect(mockChordSheetService.store).not.toHaveBeenCalled();
  });
});
