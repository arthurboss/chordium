/**
 * Tests for duplicate prevention module
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shouldLoadSamples } from '../duplicate-prevention';
import { createMockChordSheetService, createMockChordSheet } from './test-utils';

describe('Duplicate Prevention', () => {
  let mockChordSheetService: ReturnType<typeof createMockChordSheetService>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockChordSheetService = createMockChordSheetService();
  });

  it('should return true when no saved chord sheets exist', async () => {
    vi.mocked(mockChordSheetService.getAllSaved).mockResolvedValue([]);
    
    const result = await shouldLoadSamples(mockChordSheetService);
    
    expect(result).toBe(true);
    expect(mockChordSheetService.getAllSaved).toHaveBeenCalledOnce();
  });

  it('should return false when saved chord sheets exist', async () => {
    const mockChordSheet = createMockChordSheet();
    vi.mocked(mockChordSheetService.getAllSaved).mockResolvedValue([mockChordSheet]);
    
    const result = await shouldLoadSamples(mockChordSheetService);
    
    expect(result).toBe(false);
    expect(mockChordSheetService.getAllSaved).toHaveBeenCalledOnce();
  });

  it('should return false when multiple saved chord sheets exist', async () => {
    const mockChordSheets = [
      createMockChordSheet({ title: 'Song 1' }),
      createMockChordSheet({ title: 'Song 2' })
    ];
    vi.mocked(mockChordSheetService.getAllSaved).mockResolvedValue(mockChordSheets);
    
    const result = await shouldLoadSamples(mockChordSheetService);
    
    expect(result).toBe(false);
    expect(mockChordSheetService.getAllSaved).toHaveBeenCalledOnce();
  });
});
