import { Artist, Song } from "@chordium/types";
import { useArtistFilter } from "./useArtistFilter";
import { useSongFilter } from "./useSongFilter";
import type { SearchFilterState } from "@/search/types/searchFilterState";

export function useSearchFilter(
  allArtists: Artist[],
  allSongs: Song[],
  filterArtist: string,
  filterSong: string,
  hasFetched: boolean,
  shouldFetch: boolean,
  filterVersion?: number
): SearchFilterState {
  const filteredArtists = useArtistFilter(
    allArtists,
    filterArtist,
    hasFetched,
    filterVersion
  );
  const filteredSongs = useSongFilter(
    allSongs,
    filterSong,
    hasFetched,
    filterVersion
  );

  return {
    filteredArtists,
    filteredSongs,
  };
}
