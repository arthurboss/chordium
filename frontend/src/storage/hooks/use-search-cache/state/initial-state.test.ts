import { describe, it, expect } from 'vitest';
import { initialState } from './use-search-cache-state';

describe('initialState', () => {
  it('should have correct initial values', () => {
    expect(initialState).toEqual({
      cacheEntry: null,
      isLoading: false,
      error: null,
    });
  });
});
