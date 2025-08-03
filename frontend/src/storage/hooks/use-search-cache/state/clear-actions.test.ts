import { describe, it, expect } from 'vitest';
import { 
  useSearchCacheReducer,
  type UseSearchCacheAction,
  type UseSearchCacheState 
} from './use-search-cache-state';
import { createMockCacheEntry } from './test-utils';

describe('useSearchCacheReducer - State Clearing Actions', () => {

  describe('CLEAR_ERROR action', () => {
    it('should clear error while preserving other state', () => {
      const mockCacheEntry = createMockCacheEntry();

      const previousState: UseSearchCacheState = {
        cacheEntry: mockCacheEntry,
        isLoading: false,
        error: 'Some error',
      };

      const action: UseSearchCacheAction = { type: 'CLEAR_ERROR' };
      const newState = useSearchCacheReducer(previousState, action);

      expect(newState).toEqual({
        cacheEntry: mockCacheEntry,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('CLEAR_CACHE_ENTRY action', () => {
    it('should clear cache entry while preserving other state', () => {
      const mockCacheEntry = createMockCacheEntry();

      const previousState: UseSearchCacheState = {
        cacheEntry: mockCacheEntry,
        isLoading: false,
        error: null,
      };

      const action: UseSearchCacheAction = { type: 'CLEAR_CACHE_ENTRY' };
      const newState = useSearchCacheReducer(previousState, action);

      expect(newState).toEqual({
        cacheEntry: null,
        isLoading: false,
        error: null,
      });
    });
  });
});
