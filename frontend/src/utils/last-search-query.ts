/**
 * Utility functions for storing and retrieving the last search query
 * Used for preserving search state when navigating
 */

const LAST_SEARCH_QUERY_KEY = 'lastSearchQuery';

export interface LastSearchQuery {
  artist: string;
  song: string;
  timestamp: number;
}

/**
 * Store the last search query in localStorage
 */
export function setLastSearchQuery(artist: string, song: string): void {
  const queryData: LastSearchQuery = {
    artist: artist || '',
    song: song || '',
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(LAST_SEARCH_QUERY_KEY, JSON.stringify(queryData));
  } catch (error) {
    console.warn('Failed to store last search query:', error);
  }
}

/**
 * Retrieve the last search query from localStorage
 */
export function getLastSearchQuery(): LastSearchQuery | null {
  try {
    const stored = localStorage.getItem(LAST_SEARCH_QUERY_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as LastSearchQuery;
    
    // Validate the structure
    if (typeof parsed.artist === 'string' && typeof parsed.song === 'string') {
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to retrieve last search query:', error);
    return null;
  }
}

/**
 * Clear the last search query from localStorage
 */
export function clearLastSearchQuery(): void {
  try {
    localStorage.removeItem(LAST_SEARCH_QUERY_KEY);
  } catch (error) {
    console.warn('Failed to clear last search query:', error);
  }
}
