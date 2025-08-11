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
  UrlPreservationConfig,
} from "./navigation.types";

// Utilities
export { getUrlPreservationConfig } from "./url-preservation";
export { 
  storeNavigationPath, 
  getNavigationPath, 
  clearNavigationPath,
  isMyChordSheetsPath,
  isSearchPath 
} from "@/utils/navigation-path-storage";
