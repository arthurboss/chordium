import { useCallback, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import type { Artist } from "@chordium/types";
import { 
  getOriginalSearchUrl, 
  getNavigationSource, 
  storeOriginalSearchUrl 
} from "@/utils/chordium-navigation";
import {
  navigateToArtist as navigateToArtistUtil,
  isArtistPage,
  extractArtistFromUrl,
} from "@/search/utils";

/**
 * Consolidated navigation hook
 * 
 * Provides unified navigation interface across the application.
 * Automatically preserves search URLs and manages navigation sources.
 */
export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Auto-preserve search URLs (merged from usePreserveSearchUrlEffect)
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const isBasicAppTab = location.pathname === '/my-chord-sheets' ||
      location.pathname === '/upload' ||
      (location.pathname === '/search' && !location.search);
    
    // Don't auto-store chord sheet URLs (they follow the pattern /:artist/:song)
    const isChordSheetPath = location.pathname.split('/').filter(Boolean).length === 2 &&
      !location.pathname.startsWith('/search');
    
    if (!isBasicAppTab && !isChordSheetPath) {
      storeOriginalSearchUrl(currentPath);
    }
  }, [location.pathname, location.search]);

  // Basic navigation methods
  const navigateToMyChordSheets = useCallback(() => {
    navigate('/my-chord-sheets');
  }, [navigate]);
  
  const navigateToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const navigateToSearch = useCallback(() => {
    // First, try to get the stored original search URL
    const originalSearchUrl = getOriginalSearchUrl();
    
    if (originalSearchUrl) {
      navigate(originalSearchUrl);
      return;
    }

    // If no stored URL, try to construct search URL from current path
    // This handles the case where user came from search results
    const { artist } = params;
    
    if (artist) {
      // Navigate to artist search page - this will trigger loading cached results
      // Don't double-convert the slug - artist param is already a slug
      navigate(`/search?artist=${artist}`);
      return;
    }

    // Fallback to general search page
    navigate('/search');
  }, [navigate, params]);

  // Smart back navigation based on stored navigation source
  const navigateBack = useCallback(() => {
    const navigationSource = getNavigationSource();
    
    if (navigationSource === 'my-chord-sheets') {
      navigateToMyChordSheets();
    } else if (navigationSource === 'search') {
      navigateToSearch();
    } else {
      // Fallback: if no source is stored, determine based on context
      navigateToSearch();
    }
  }, [navigateToMyChordSheets, navigateToSearch]);

  // Artist-specific navigation
  const navigateToArtist = useCallback(
    (artist: Artist) => {
      navigateToArtistUtil(artist, navigate);
    },
    [navigate]
  );

  // Utility methods
  const isOnArtistPage = useCallback(() => {
    return isArtistPage(location.pathname);
  }, [location.pathname]);

  const getCurrentArtistPath = useCallback(() => {
    return extractArtistFromUrl(location.pathname);
  }, [location.pathname]);

  return {
    // Basic navigation
    navigateToMyChordSheets,
    navigateToHome,
    navigateToSearch,
    navigateBack,
    
    // Artist navigation
    navigateToArtist,
    
    // Utility methods
    isOnArtistPage,
    getCurrentArtistPath,
  };
}
