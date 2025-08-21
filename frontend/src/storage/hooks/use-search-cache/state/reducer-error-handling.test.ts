import { describe, it, expect } from 'vitest';
import { 
  useSearchCacheReducer,
  type UseSearchCacheAction,
  type UseSearchCacheState 
} from './use-search-cache-state';

describe('useSearchCacheReducer - Error Handling', () => {
  it('should return current state for unknown action', () => {
    const previousState: UseSearchCacheState = {
      cacheEntry: null,
      isLoading: false,
      error: null,
    };

    // @ts-expect-error Testing unknown action type
    const action: UseSearchCacheAction = { type: 'UNKNOWN_ACTION' };
    const newState = useSearchCacheReducer(previousState, action);

    expect(newState).toEqual(previousState);
  });
});
