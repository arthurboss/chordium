import { getSearchQuery } from "@/search/utils/core/getSearchQuery";

export const SEARCH_QUERY_KEY = 'chordium_search_query';

export interface StoredSearch {
  query: string;
  lastRoute?: string;
}

/**
 * Reads the search kept for the lifetime of the tab.
 *
 * Entries written before search became a single field hold an artist and a title
 * in separate properties. Joining them recovers the same phrase, so a session in
 * progress survives the change instead of emptying itself.
 */
export function readStoredSearch(): StoredSearch | null {
  try {
    const raw = sessionStorage.getItem(SEARCH_QUERY_KEY);
    if (!raw) return null;

    const stored = JSON.parse(raw);
    if (typeof stored?.query === 'string') return stored as StoredSearch;

    const joined = [stored?.artist, stored?.song].filter(Boolean).join(' ').trim();
    return joined ? { query: joined, lastRoute: stored?.lastRoute } : null;
  } catch (error) {
    console.warn('Failed to restore search query from session storage:', error);
    sessionStorage.removeItem(SEARCH_QUERY_KEY);
    return null;
  }
}

/** Reads the search out of a URL's query string. */
export function readQueryFromUrl(search: string): string {
  return getSearchQuery(new URLSearchParams(search));
}
