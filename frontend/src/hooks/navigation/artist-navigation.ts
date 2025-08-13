import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Artist } from "@chordium/types";
import { navigateToArtist as navigateToArtistUtil } from "@/search/utils";
import type { ArtistNavigationMethods } from "./navigation.types";

/**
 * Provides artist-specific navigation functionality
 * 
 * @returns Artist navigation methods
 */
export function useArtistNavigation(): ArtistNavigationMethods {
  const navigate = useNavigate();

  const navigateToArtist = useCallback(
    (artist: Artist) => {
      navigateToArtistUtil(artist, navigate);
    },
    [navigate]
  );

  return {
    navigateToArtist,
  };
}
