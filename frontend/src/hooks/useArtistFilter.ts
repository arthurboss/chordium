import { useMemo } from 'react';
import { Artist } from '@chordium/types';
import { filterArtistsByNameOrPath } from '@/search/utils';

/**
 * Custom hook for filtering artists based on search input
 * 
 * @param allArtists - Array of all artists to filter
 * @param filterArtist - Search term for filtering artists
 * @param hasFetched - Whether data has been fetched
 * @param filterVersion - Optional version to force recompute
 * @returns Filtered array of artists
 */
export function useArtistFilter(
  allArtists: Artist[],
  filterArtist: string,
  hasFetched: boolean,
  filterVersion?: number
): Artist[] {
  return useMemo(() => {
    if (!hasFetched) return [];
    if (!filterArtist) return allArtists;
    return filterArtistsByNameOrPath(allArtists, filterArtist);
  }, [allArtists, filterArtist, hasFetched, filterVersion]);
} 