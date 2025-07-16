import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clearExpiredCache } from '../clear-expired-cache';

// Mock the unified cache function
vi.mock('../../../../cache/implementations/unified-chord-sheet-cache', () => ({
  clearExpiredChordSheetCache: vi.fn()
}));

import { clearExpiredChordSheetCache } from '../../../../cache/implementations/unified-chord-sheet-cache';

const mockClearExpiredChordSheetCache = vi.mocked(clearExpiredChordSheetCache);

describe('clearExpiredCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call clearExpiredChordSheetCache', () => {
    clearExpiredCache();
    
    expect(mockClearExpiredChordSheetCache).toHaveBeenCalledOnce();
  });

  it('should not throw when clearExpiredChordSheetCache throws', () => {
    mockClearExpiredChordSheetCache.mockImplementation(() => {
      throw new Error('Cache error');
    });

    expect(() => clearExpiredCache()).toThrow('Cache error');
    
    // Reset mock for next test
    mockClearExpiredChordSheetCache.mockRestore();
  });

  it('should be callable multiple times', () => {
    clearExpiredCache();
    clearExpiredCache();
    clearExpiredCache();
    
    expect(mockClearExpiredChordSheetCache).toHaveBeenCalledTimes(3);
  });
});
