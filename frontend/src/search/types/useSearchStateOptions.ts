import type { Artist, Song } from "@chordium/types";

/**
 * Options interface for useSearchState hook
 */
export interface UseSearchStateOptions {
  artist: string;
  song: string;
  filterArtist: string;
  filterSong: string;
  shouldFetch: boolean;
  activeArtist: Artist | null;
  hasSearched: boolean;
  onFetchComplete?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onArtistSelect?: (artist: Artist) => void;
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
  myChordSheets?: Song[];
}
