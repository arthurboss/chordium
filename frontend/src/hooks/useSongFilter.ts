import { useMemo } from 'react';
import { Song } from '@chordium/types';
import { isAccentInsensitiveMatch } from '@/search/utils';

/**
 * Custom hook for filtering songs based on search input
 * 
 * @param allSongs - Array of all songs to filter
 * @param filterSong - Search term for filtering songs
 * @param hasFetched - Whether data has been fetched
 * @param filterVersion - Optional version to force recompute
 * @returns Filtered array of songs
 */
export function useSongFilter(
  allSongs: Song[],
  filterSong: string,
  hasFetched: boolean,
  filterVersion?: number
): Song[] {
  return useMemo(() => {
    if (!hasFetched) return [];
    if (!filterSong) return allSongs;
    return allSongs.filter(song => isAccentInsensitiveMatch(filterSong, song.title));
  }, [allSongs, filterSong, hasFetched, filterVersion]);
} 