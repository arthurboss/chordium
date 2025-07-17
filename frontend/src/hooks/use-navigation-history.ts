import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLastSearchQuery } from '@/cache/implementations/search-cache';

/**
 * Hook to manage navigation between pages with state preservation
 */
export function useNavigationHistory() {
  const navigate = useNavigate();
  
  /**
   * Navigate back to search results if they exist
   */
  const navigateBackToSearch = useCallback(() => {
    // Check if we have a last search query
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
