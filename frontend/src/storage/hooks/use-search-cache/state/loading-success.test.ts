import { describe, it, expect } from 'vitest';
import { 
  useSearchCacheReducer,
  type UseSearchCacheAction,
  type UseSearchCacheState 
} from './use-search-cache-state';
import { createMockCacheEntry } from './test-utils';

describe('useSearchCacheReducer - LOADING_SUCCESS', () => {

  it('should set loading to false and update cache entry', () => {
    const mockCacheEntry = createMockCacheEntry({
      results: [{ path: 'artist/test', displayName: 'Test Artist', songCount: 5 }],
    });

    const previousState: UseSearchCacheState = {
      cacheEntry: null,
      isLoading: true,
      error: null,
    };

    const action: UseSearchCacheAction = { 
      type: 'LOADING_SUCCESS', 
      payload: mockCacheEntry 
    };
    const newState = useSearchCacheReducer(previousState, action);

    expect(newState).toEqual({
      cacheEntry: mockCacheEntry,
      isLoading: false,
      error: null,
    });
  });

  it('should handle null payload', () => {
    const previousState: UseSearchCacheState = {
      cacheEntry: null,
      isLoading: true,
      error: null,
    };

    const action: UseSearchCacheAction = { 
      type: 'LOADING_SUCCESS', 
      payload: null 
    };
    const newState = useSearchCacheReducer(previousState, action);

    expect(newState).toEqual({
      cacheEntry: null,
      isLoading: false,
      error: null,
    });
  });
});
