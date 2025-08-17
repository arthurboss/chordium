import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { isArtistPage, extractArtistFromUrl } from "@/search/utils";
import type { NavigationUtilityMethods } from "./navigation.types";

/**
 * Provides navigation utility methods for path detection and extraction
 * 
 * @returns Navigation utility methods
 */
export function useNavigationUtilities(): NavigationUtilityMethods {
  const location = useLocation();

  const isOnArtistPage = useCallback(() => {
    return isArtistPage(location.pathname);
  }, [location.pathname]);

  const getCurrentArtistPath = useCallback(() => {
    return extractArtistFromUrl(location.pathname);
  }, [location.pathname]);

  return {
    isOnArtistPage,
    getCurrentArtistPath,
  };
}
