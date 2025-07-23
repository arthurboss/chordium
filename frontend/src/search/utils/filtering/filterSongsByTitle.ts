/**
 * Filters songs by title, path, or artist name
 * Single responsibility: Song filtering by multiple criteria
 */
import { Song } from '@chordium/types';
import { normalizeForSearch } from '../normalization/normalizeForSearch';
import { normalizePathForComparison } from '@/utils/normalize-path-for-comparison';

export function filterSongsByTitle(songs: Song[], filter: string): Song[] {
  if (!filter) return songs;
  
  // Normalize the user's filter text (remove special chars, etc.)
  const normalizedFilter = normalizeForSearch(filter);
  
  return songs.filter(song => {
    // Check if normalized title includes the normalized filter
    const titleMatch = normalizeForSearch(song.title).includes(normalizedFilter);
    
    // For path matching, first remove all hyphens from the path then compare
    // This way "acdc" will match a path value of "ac-dc"
    const pathMatch = song.path && typeof song.path === 'string' && 
                     normalizePathForComparison(song.path).includes(normalizedFilter);
    
    // Also check if artist name matches when available
    const artistMatch = song.artist && 
                       normalizeForSearch(song.artist).includes(normalizedFilter);
    
    return titleMatch || pathMatch || artistMatch;
  });
}
