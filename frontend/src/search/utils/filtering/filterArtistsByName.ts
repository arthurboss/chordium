/**
 * Filters a list of artists based on a search term.
 *
 * Matches against both the artist's display name and path using
 * normalized text comparison for better search results.
 *
 * @param artists - Array of artist objects to filter
 * @param filter - Search term to filter by
 * @returns Filtered array of artists matching the search term
 */
import { Artist } from "@chordium/types";
import { normalizeForSearch } from "../normalization/normalizeForSearch";

export function filterArtistsByNameOrPath(
  artists: Artist[],
  filter: string
): Artist[] {
  if (!filter) return artists;

  // Normalize the user's filter text (remove special chars, etc.)
  const normalizedFilter = normalizeForSearch(filter);

  return artists.filter((artist) => {
    const normalizedDisplayName = normalizeForSearch(artist.displayName);
    const normalizedPath = normalizeForSearch(artist.path);
    const displayNameMatch = normalizedDisplayName.includes(normalizedFilter);
    const pathMatch = normalizedPath.includes(normalizedFilter);
    return displayNameMatch || pathMatch;
  });
}
