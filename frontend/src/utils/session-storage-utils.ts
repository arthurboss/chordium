/**
 * Utility functions for session storage management
 */

// Maximum number of chord URLs to keep in session storage
const MAX_CHORD_URLS = 20;

// Prefix used for chord URL keys in session storage
const CHORD_URL_PREFIX = 'chord-url-';

/**
 * Store a chord URL in session storage and manage the storage limit
 * @param artistSlug The artist slug
 * @param songSlug The song slug
 * @param url The chord URL to store
 */
export function storeChordUrl(artistSlug: string, songSlug: string, url: string) {
  const key = `${CHORD_URL_PREFIX}${artistSlug}-${songSlug}`;
  
  try {
    // First, clean up old entries if we've reached the limit
    const sessionKeys = Object.keys(sessionStorage)
      .filter(k => k.startsWith(CHORD_URL_PREFIX) && !k.endsWith('-timestamp'))
      .sort((a, b) => {
        // Try to get timestamps if they exist
        const timeA = sessionStorage.getItem(`${a}-timestamp`) || '0';
        const timeB = sessionStorage.getItem(`${b}-timestamp`) || '0';
        return parseInt(timeA) - parseInt(timeB); // Sort by oldest first
      });
    
    // If we're at or over the limit, remove the oldest items
    if (sessionKeys.length >= MAX_CHORD_URLS) {
      // Remove oldest items to make room for the new one
      const itemsToRemove = sessionKeys.length - MAX_CHORD_URLS + 1;
      sessionKeys.slice(0, itemsToRemove).forEach(oldKey => {
        sessionStorage.removeItem(oldKey);
        sessionStorage.removeItem(`${oldKey}-timestamp`);
      });
    }
    
    // Store the URL and a timestamp
    sessionStorage.setItem(key, url);
    sessionStorage.setItem(`${key}-timestamp`, Date.now().toString());
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to store chord URL in session storage:', error);
    }
  }
}

/**
 * Get a chord URL from session storage
 * @param artistSlug The artist slug
 * @param songSlug The song slug
 * @returns The chord URL or null if not found
 */
export function getChordUrl(artistSlug: string, songSlug: string): string | null {
  const key = `${CHORD_URL_PREFIX}${artistSlug}-${songSlug}`;
  return sessionStorage.getItem(key);
}
