/**
 * Filters a list of artists based on a search term
 * Checks both the displayName and the path (after normalization)
 * Single responsibility: Artist filtering by name or path
 */
import { Artist } from '@chordium/types';
import { normalizeForSearchUnicode } from '../normalization/normalizeForSearch';
import { normalizePathForComparison } from '@/utils/normalize-path-for-comparison';

export function filterArtistsByNameOrPath(artists: Artist[], filter: string): Artist[] {
  if (!filter) return artists;
  
  // Normalize the user's filter text (remove special chars, etc.)
  const normalizedFilter = normalizeForSearchUnicode(filter);
  
  return artists.filter(artist => {
    // Check if normalized displayName includes the normalized filter
    const displayNameMatch = normalizeForSearchUnicode(artist.displayName).includes(normalizedFilter);
    
    // For path matching, first remove all hyphens from the path then compare
    // This way "acdc" will match a path value of "ac-dc"
    const pathMatch = artist.path && typeof artist.path === 'string' && 
                     normalizePathForComparison(artist.path).includes(normalizedFilter);
    
    return displayNameMatch || pathMatch;
  });
}
