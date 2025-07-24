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
import { Artist } from '@chordium/types';
import { normalizeForSearch } from '../normalization/normalizeForSearch';
import { normalizePathForComparison } from '../normalization/normalizePathForComparison';

export function filterArtistsByNameOrPath(artists: Artist[], filter: string): Artist[] {
  if (!filter) return artists;
  
  // Normalize the user's filter text (remove special chars, etc.)
  const normalizedFilter = normalizeForSearch(filter);
  
  return artists.filter(artist => {
    // Check if normalized displayName includes the normalized filter
    const displayNameMatch = normalizeForSearch(artist.displayName).includes(normalizedFilter);
    
    // For path matching, first remove all hyphens from the path then compare
    // This way "acdc" will match a path value of "ac-dc"
    const pathMatch = artist.path && typeof artist.path === 'string' && 
                     normalizePathForComparison(artist.path).includes(normalizedFilter);
    
    return displayNameMatch || pathMatch;
  });
}
