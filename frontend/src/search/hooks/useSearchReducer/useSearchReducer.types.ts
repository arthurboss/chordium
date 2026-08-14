import type { Artist, Song } from "@chordium/types";

/**
 * Options interface for useSearchReducer hook
 */
export interface UseSearchReducerOptions {
  /** The whole search as typed, artist and title together. */
  query: string;
  /** Narrows an artist's song list once one is open. */
  filter: string;
  shouldFetch: boolean;
  activeArtist: Artist | null;
  onFetchComplete?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onArtistSelect?: (artist: Artist) => void;
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
}
