/**
 * Navigate to artist page when artist is selected from search results.
 * 
 * @param artist - The artist object containing navigation path
 * @param navigate - React Router navigate function for programmatic navigation
 */
import { Artist } from "@chordium/types";

export function navigateToArtist(
  artist: Artist, 
  navigate: (path: string, options?: { replace?: boolean }) => void
): void {
  const artistPath = `/${artist.path}`;
  navigate(artistPath, { replace: true });
}
