import type { Song, Artist } from "@chordium/types";

export interface SearchTabLogicProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
}

export interface SearchTabLogicResult {
  activeArtist: Artist | null;
  loading: boolean;
  /** The search as currently typed. */
  input: string;
  /** The search that produced the results on screen. */
  submittedQuery: string;
  /** Narrows an open artist's song list. Empty until the box is typed in. */
  artistFilter: string;
  clearDisabled: boolean;
  hasSearched: boolean;
  shouldFetch: boolean;
  handleBackToArtistList: () => void;
  handleArtistSelect: (artist: Artist) => void;
  handleInputChange: (value: string) => void;
  handleSearchSubmit: (value: string) => void;
  handleLoadingChange: (isLoading: boolean) => void;
  handleClearSearch: () => void;
  setShouldFetch: (val: boolean) => void;
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
}
