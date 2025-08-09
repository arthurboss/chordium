import type { SearchResultsAction } from "../../../types/searchResultsAction";

/**
 * Options interface for useSearchFetch hook
 */
export interface UseSearchFetchOptions {
  dispatch: React.Dispatch<SearchResultsAction>;
  onFetchComplete?: () => void;
  setSearchFetching: (loading: boolean) => void;
}
