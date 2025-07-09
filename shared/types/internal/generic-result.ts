import type { SearchResult } from './search-result.js';

/**
 * Generic result type for fallback transformations
 */
export interface GenericResult extends SearchResult {
  title: string;
}
