import type { Artist, Song } from "@chordium/types";

/**
 * Options interface for useSearchReducer hook
 */
export interface UseSearchReducerOptions {
  artist: string;
  song: string;
  filterSong: string;
  shouldFetch: boolean;
  activeArtist: Artist | null;
  onFetchComplete?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onArtistSelect?: (artist: Artist) => void;
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
}
