import { describe, it, expect } from 'vitest';
import { 
  useSearchCacheReducer,
  type UseSearchCacheAction,
  type UseSearchCacheState 
} from './use-search-cache-state';
import { createMockCacheEntry } from './test-utils';

describe('useSearchCacheReducer - LOADING_ERROR', () => {

  it('should set loading to false and update error', () => {
    const previousState: UseSearchCacheState = {
      cacheEntry: null,
      isLoading: true,
      error: null,
    };

    const action: UseSearchCacheAction = { 
      type: 'LOADING_ERROR', 
      payload: 'Test error message' 
    };
    const newState = useSearchCacheReducer(previousState, action);

    expect(newState).toEqual({
      cacheEntry: null,
      isLoading: false,
      error: 'Test error message',
    });
  });

  it('should clear existing cache entry on error', () => {
    const mockCacheEntry = createMockCacheEntry();

    const previousState: UseSearchCacheState = {
      cacheEntry: mockCacheEntry,
      isLoading: true,
      error: null,
    };

    const action: UseSearchCacheAction = { 
      type: 'LOADING_ERROR', 
      payload: 'Network error' 
    };
    const newState = useSearchCacheReducer(previousState, action);

    expect(newState.cacheEntry).toBeNull();
    expect(newState.isLoading).toBe(false);
    expect(newState.error).toBe('Network error');
  });
});
