import type { Artist } from "@chordium/types";

/**
 * Navigation source types indicating where the user came from
 */
export type NavigationSource = 'search' | 'my-chord-sheets';

/**
 * Basic navigation methods for core app navigation
 */
export interface BasicNavigationMethods {
  navigateToMyChordSheets: () => void;
  navigateToHome: () => void;
  navigateToSearch: () => void;
  navigateBack: () => void;
}

/**
 * Artist-specific navigation methods
 */
export interface ArtistNavigationMethods {
  navigateToArtist: (artist: Artist) => void;
}

/**
 * Navigation utility methods for path detection and extraction
 */
export interface NavigationUtilityMethods {
  isOnArtistPage: () => boolean;
  getCurrentArtistPath: () => string | null;
}

/**
 * Complete navigation interface combining all navigation capabilities
 */
export interface NavigationMethods extends 
  BasicNavigationMethods,
  ArtistNavigationMethods,
  NavigationUtilityMethods {}

/**
 * URL preservation configuration for determining which URLs to preserve
 */
export interface UrlPreservationConfig {
  isBasicAppTab: boolean;
  isChordSheetPath: boolean;
  currentPath: string;
}
