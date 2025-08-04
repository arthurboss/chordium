// Storage key for preserving original URL format
const ORIGINAL_SEARCH_URL_KEY = "original_search_url";

/**
 * Store the original search URL format to preserve it during navigation
 */
export function storeOriginalSearchUrl(url: string) {
  try {
    sessionStorage.setItem(ORIGINAL_SEARCH_URL_KEY, url);
  } catch (error) {
    console.warn("Failed to store original search URL:", error);
  }
}
