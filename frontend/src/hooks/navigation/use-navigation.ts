import { useBasicNavigation } from "./basic-navigation";
import { useArtistNavigation } from "./artist-navigation";
import { useNavigationUtilities } from "./navigation-utilities";
import type { NavigationMethods } from "./navigation.types";

/**
 * Consolidated navigation hook
 * 
 * Provides unified navigation interface across the application.
 * Browser history now handles navigation automatically.
 * 
 * @returns Complete navigation methods interface
 */
export function useNavigation(): NavigationMethods {
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
