/**
 * Navigate to artist page when artist is selected from search results
 * Single responsibility: Artist page navigation
 */
import { Artist } from "@chordium/types";

export function navigateToArtist(
  artist: Artist, 
  navigate: (path: string, options?: { replace?: boolean }) => void
): void {
  const artistPath = `/${artist.path}`;
  navigate(artistPath, { replace: true });
}
