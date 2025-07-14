import { Artist } from '@/types/artist';
import { Song } from '@/types/song';
import { useArtistFilter } from './useArtistFilter';
import { useSongFilter } from './useSongFilter';

interface SearchFilterState {
  filteredArtists: Artist[];
  filteredSongs: Song[];
}

export function useSearchFilter(
  allArtists: Artist[],
  allSongs: Song[],
  filterArtist: string,
  filterSong: string,
  hasFetched: boolean,
  shouldFetch: boolean,
  filterVersion?: number
): SearchFilterState {
  const filteredArtists = useArtistFilter(allArtists, filterArtist, hasFetched, filterVersion);
  const filteredSongs = useSongFilter(allSongs, filterSong, hasFetched, filterVersion);

  return {
    filteredArtists,
    filteredSongs
  };
} 