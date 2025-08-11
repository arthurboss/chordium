import { useCallback, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import type { Artist } from "@chordium/types";
import { 
  getOriginalSearchUrl, 
  getNavigationSource, 
  storeOriginalSearchUrl 
} from "@/utils/chordium-navigation";
import { toSlug } from "@/utils/url-slug-utils";
import {
  navigateToArtist as navigateToArtistUtil,
  navigateBackToSearch as navigateBackToSearchUtil,
  isArtistPage,
  extractArtistFromUrl,
} from "@/search/utils";

/**
 * Consolidated navigation hook
 * 
 * Combines functionality from useChordViewerNavigation and useArtistNavigation
 * to provide a unified navigation interface across the application.
 */
export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // Store original search parameters for artist navigation (legacy support)
  const originalSearchParams = useRef<{ artist?: string; song?: string }>({});

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
      const artistSlug = toSlug(artist.replace(/-/g, ' '));
      navigate(`/search?artist=${encodeURIComponent(artistSlug)}`);
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

  // Artist-specific navigation (from useArtistNavigation)
  const navigateToArtist = useCallback(
    (artist: Artist) => {
      // Store current URL for back navigation
      const currentUrl = location.pathname + location.search;
      storeOriginalSearchUrl(currentUrl);

      // Store current search parameters for back navigation (legacy support)
      const searchParams = new URLSearchParams(location.search);
      originalSearchParams.current = {
        artist: searchParams.get("artist") || undefined,
        song: searchParams.get("song") || undefined,
      };

      navigateToArtistUtil(artist, navigate);
    },
    [navigate, location.search, location.pathname]
  );

  // Navigate back to search results (legacy method for compatibility)
  const navigateBackToSearch = useCallback(() => {
    navigateBackToSearchUtil(originalSearchParams.current, navigate);
  }, [navigate]);

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
    navigateBackToSearch, // Legacy compatibility
    
    // Utility methods
    isOnArtistPage,
    getCurrentArtistPath,
    
    // Legacy compatibility
    originalSearchParams: originalSearchParams.current,
  };
}

/**
 * Legacy alias for backward compatibility
 */
export const useChordViewerNavigation = useNavigation;

/**
 * Legacy alias for backward compatibility  
 */
export const useArtistNavigation = useNavigation;
