import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to persist the last search URL across component unmounts
 * This ensures that when switching tabs, the URL is preserved
 */
export function useUrlPersistence() {
  const location = useLocation();
  const [lastSearchUrl, setLastSearchUrl] = useState<string | null>(null);

  // Track when we're on a search-related page and store the URL
  useEffect(() => {
    const currentPath = location.pathname + location.search;

    console.log('🔄 useUrlPersistence: tracking URL:', {
      currentPath,
      pathname: location.pathname,
      search: location.search,
      isSearchPage: location.pathname === '/search',
      isMyChordSheets: location.pathname.startsWith('/my-chord-sheets'),
      isUpload: location.pathname.startsWith('/upload'),
      isRoot: location.pathname === '/',
      shouldStore: location.pathname === '/search' ||
        (!location.pathname.startsWith('/my-chord-sheets') &&
          !location.pathname.startsWith('/upload') &&
          location.pathname !== '/')
    });

    // Store URL if it's a search page or an artist page (not basic app tabs)
    if (location.pathname === '/search' ||
      (!location.pathname.startsWith('/my-chord-sheets') &&
        !location.pathname.startsWith('/upload') &&
        location.pathname !== '/')) {
      console.log('🔄 useUrlPersistence: storing URL:', currentPath);
      setLastSearchUrl(currentPath);
    } else {
      console.log('🔄 useUrlPersistence: not storing URL (basic app tab)');
    }
  }, [location.pathname, location.search]);

  return lastSearchUrl;
}
