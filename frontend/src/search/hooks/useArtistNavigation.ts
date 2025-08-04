import { useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Artist } from "@chordium/types";
import {
  navigateToArtist as navigateToArtistUtil,
  navigateBackToSearch as navigateBackToSearchUtil,
  isArtistPage,
  extractArtistFromUrl,
} from "@/search/utils";
import { storeOriginalSearchUrl } from "@/utils/storeOriginalSearchUrl";

/**
 * Hook to manage artist navigation state and logic
 *
 * Follows DRY: Centralizes artist navigation logic
 * Follows SRP: Single responsibility for artist navigation
 */
export const useArtistNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Store original search parameters when navigating to artist
  const originalSearchParams = useRef<{ artist?: string; song?: string }>({});

  /**
   * Navigate to artist page when artist is selected
   */
  const navigateToArtist = useCallback(
    (artist: Artist) => {
      // Store current URL for back navigation
      const currentUrl = location.pathname + location.search;
      storeOriginalSearchUrl(currentUrl);

      // Store current search parameters for back navigation
      const searchParams = new URLSearchParams(location.search);
      originalSearchParams.current = {
        artist: searchParams.get("artist") || undefined,
        song: searchParams.get("song") || undefined,
      };

      navigateToArtistUtil(artist, navigate);
    },
    [navigate, location.search, location.pathname]
  );

  /**
   * Navigate back to search results
   */
  const navigateBackToSearch = useCallback(() => {
    navigateBackToSearchUtil(originalSearchParams.current, navigate);
  }, [navigate]);

  /**
   * Check if currently on an artist page
   */
  const isOnArtistPage = useCallback(() => {
    return isArtistPage(location.pathname);
  }, [location.pathname]);

  /**
   * Get current artist path from URL
   */
  const getCurrentArtistPath = useCallback(() => {
    return extractArtistFromUrl(location.pathname);
  }, [location.pathname]);

  return {
    navigateToArtist,
    navigateBackToSearch,
    isOnArtistPage,
    getCurrentArtistPath,
    originalSearchParams: originalSearchParams.current,
  };
};
