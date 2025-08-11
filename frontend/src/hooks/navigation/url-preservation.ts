import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { storeOriginalSearchUrl } from "@/utils/chordium-navigation";
import type { UrlPreservationConfig } from "./navigation.types";

/**
 * Determines if the current path should be preserved as original search URL
 * 
 * @param pathname - Current location pathname
 * @param search - Current location search parameters
 * @returns URL preservation configuration
 */
export function getUrlPreservationConfig(pathname: string, search: string): UrlPreservationConfig {
  const currentPath = pathname + search;
  
  const isBasicAppTab = pathname === '/my-chord-sheets' ||
    pathname === '/upload' ||
    (pathname === '/search' && !search);
  
  // Don't auto-store chord sheet URLs (they follow the pattern /:artist/:song)
  const isChordSheetPath = pathname.split('/').filter(Boolean).length === 2 &&
    !pathname.startsWith('/search');
  
  return {
    isBasicAppTab,
    isChordSheetPath,
    currentPath
  };
}

/**
 * Hook that automatically preserves search URLs during navigation
 * 
 * Prevents chord sheet URLs from overwriting search URLs and maintains
 * navigation state for proper back button functionality.
 */
export function useUrlPreservation(): void {
  const location = useLocation();

  useEffect(() => {
    const config = getUrlPreservationConfig(location.pathname, location.search);
    
    if (!config.isBasicAppTab && !config.isChordSheetPath) {
      storeOriginalSearchUrl(config.currentPath);
    }
  }, [location.pathname, location.search]);
}
