/**
 * Navigate to artist page when artist is selected from search results.
 * 
 * @param artist - The artist object containing navigation path
 * @param navigate - React Router navigate function for programmatic navigation
 */
import type { Artist } from "@chordium/types";
import { storeArtistDisplayName } from "../artist/artist-display-name-cache";

export const ARTIST_DISPLAY_NAME_KEY = 'chordium_artist_display_name';

export function navigateToArtist(
  artist: Artist, 
  navigate: (path: string, options?: { replace?: boolean }) => void
): void {
  try {
    sessionStorage.setItem(ARTIST_DISPLAY_NAME_KEY, JSON.stringify({ path: artist.path, displayName: artist.displayName }));
  } catch {}
  // Persist the displayName as returned by the search API (e.g. "AC/DC"),
  // so /:artist can reuse it later instead of re-deriving a name from DOM
  // scraping or a slug guess.
  void storeArtistDisplayName(artist.path, artist.displayName);
  const artistPath = `/${artist.path}`;
  navigate(artistPath, { replace: true });
}
