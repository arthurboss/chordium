import { useUrlPreservation } from "./url-preservation";
import { useBasicNavigation } from "./basic-navigation";
import { useArtistNavigation } from "./artist-navigation";
import { useNavigationUtilities } from "./navigation-utilities";
import type { NavigationMethods } from "./navigation.types";

/**
 * Consolidated navigation hook
 * 
 * Provides unified navigation interface across the application.
 * Automatically preserves search URLs and manages navigation sources.
 * 
 * @returns Complete navigation methods interface
 */
export function useNavigation(): NavigationMethods {
  // Auto-preserve search URLs during navigation
  useUrlPreservation();

  // Get navigation method groups
  const basicNavigation = useBasicNavigation();
  const artistNavigation = useArtistNavigation();
  const navigationUtilities = useNavigationUtilities();

  return {
    ...basicNavigation,
    ...artistNavigation,
    ...navigationUtilities,
  };
}
