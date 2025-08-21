import type { SearchCacheEntry } from "../../types/search-cache";

/**
 * State returned by useSearchCache hook
 */
export interface UseSearchCacheState {
  /** Current cached search entry */
  cacheEntry: SearchCacheEntry | null;
  /** Loading state for cache operations */
  isLoading: boolean;
  /** Error message if operation failed */
  error: string | null;
}
