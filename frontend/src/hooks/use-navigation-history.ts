import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLastSearchQuery } from '@/cache/implementations/search-cache';

// Storage key for preserving original URL format
const ORIGINAL_SEARCH_URL_KEY = 'original_search_url';

/**
 * Store the original search URL format to preserve it during navigation
 */
export function storeOriginalSearchUrl(url: string) {
  try {
    sessionStorage.setItem(ORIGINAL_SEARCH_URL_KEY, url);
  } catch (error) {
    console.warn('Failed to store original search URL:', error);
  }
}

/**
 * Get the stored original search URL format
 */
export function getOriginalSearchUrl(): string | null {
  try {
    return sessionStorage.getItem(ORIGINAL_SEARCH_URL_KEY);
  } catch (error) {
    console.warn('Failed to get original search URL:', error);
    return null;
  }
}

/**
 * Clear the stored original search URL
 */
export function clearOriginalSearchUrl() {
  try {
    sessionStorage.removeItem(ORIGINAL_SEARCH_URL_KEY);
  } catch (error) {
    console.warn('Failed to clear original search URL:', error);
  }
}

/**
 * Hook to manage navigation between pages with state preservation
 */
export function useNavigationHistory() {
  const navigate = useNavigate();
  
  /**
   * Navigate back to search results if they exist, preserving original URL format
   */
  const navigateBackToSearch = useCallback(() => {
    // First try to use the stored original URL format
    const originalUrl = getOriginalSearchUrl();
    if (originalUrl) {
      navigate(originalUrl);
      return;
    }
    
    // Fallback to reconstructing URL from search cache
    const lastQuery = getLastSearchQuery();
    
    if (lastQuery) {
      // Construct URL parameters
      const params = new URLSearchParams();
      if (lastQuery.artist) params.set('artist', lastQuery.artist);
      if (lastQuery.song) params.set('song', lastQuery.song);
      
      // Navigate back to search with the parameters
      navigate(`/search?${params.toString()}`);
    } else {
      // If no search history, just go to the search page
      navigate('/search');
    }
  }, [navigate]);
  
  return { navigateBackToSearch };
}
