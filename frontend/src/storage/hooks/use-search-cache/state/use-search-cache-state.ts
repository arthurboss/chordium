import type { SearchCacheEntry } from "../../../types/search-cache";

/**
 * State for search cache hook
 */
export interface UseSearchCacheState {
  cacheEntry: SearchCacheEntry | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Actions for search cache state management
 */
export type UseSearchCacheAction =
  | { type: "LOADING_START" }
  | { type: "LOADING_SUCCESS"; payload: SearchCacheEntry | null }
  | { type: "LOADING_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "CLEAR_CACHE_ENTRY" };

/**
 * Initial state for search cache hook
 */
export const initialState: UseSearchCacheState = {
  cacheEntry: null,
  isLoading: false,
  error: null,
};

/**
 * Reducer for search cache state management
 */
export function useSearchCacheReducer(
  state: UseSearchCacheState,
  action: UseSearchCacheAction
): UseSearchCacheState {
  switch (action.type) {
    case "LOADING_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "LOADING_SUCCESS":
      return {
        ...state,
        isLoading: false,
        cacheEntry: action.payload,
        error: null,
      };

    case "LOADING_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        cacheEntry: null,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "CLEAR_CACHE_ENTRY":
      return {
        ...state,
        cacheEntry: null,
      };

    default:
      return state;
  }
}
