// Main hook export
export { useNavigation } from "./use-navigation";

// Individual hooks for specific use cases
export { useBasicNavigation } from "./basic-navigation";
export { useArtistNavigation } from "./artist-navigation";
export { useNavigationUtilities } from "./navigation-utilities";
export { useUrlPreservation } from "./url-preservation";

// Types
export type {
  NavigationSource,
  BasicNavigationMethods,
  ArtistNavigationMethods,
  NavigationUtilityMethods,
  NavigationMethods,
} from "./navigation.types";

// Note: Navigation path storage utilities have been removed
// Browser history now handles navigation automatically
