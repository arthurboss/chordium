import { describe, it, expect } from 'vitest';
import { 
  useSearchCacheReducer,
  type UseSearchCacheAction,
  type UseSearchCacheState 
} from './use-search-cache-state';
import { createMockCacheEntry } from './test-utils';

describe('useSearchCacheReducer - LOADING_START', () => {
  it('should set loading to true and clear error', () => {
    const previousState: UseSearchCacheState = {
      cacheEntry: null,
      isLoading: false,
      error: 'Previous error',
    };

    const action: UseSearchCacheAction = { type: 'LOADING_START' };
    const newState = useSearchCacheReducer(previousState, action);

    expect(newState).toEqual({
      cacheEntry: null,
      isLoading: true,
      error: null,
    });
  });

  it('should preserve existing cache entry', () => {
    const mockCacheEntry = createMockCacheEntry();

    const previousState: UseSearchCacheState = {
      cacheEntry: mockCacheEntry,
      isLoading: false,
      error: null,
    };

    const action: UseSearchCacheAction = { type: 'LOADING_START' };
    const newState = useSearchCacheReducer(previousState, action);

    expect(newState.cacheEntry).toEqual(mockCacheEntry);
    expect(newState.isLoading).toBe(true);
    expect(newState.error).toBeNull();
  });
});
