import type { Song, Artist } from "@chordium/types";
import type { SearchDataState } from "../../../types/SearchDataState";

export interface SearchTabLogicProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
}

export interface SearchTabLogicResult {
  selectedSongLocal: Song | null;
  activeArtist: Artist | null;
  loading: boolean;
  artistInput: string;
  songInput: string;
  clearDisabled: boolean;
  hasSearched: boolean;
  searchState: SearchDataState;
  submittedArtist: string;
  submittedSong: string;
  shouldFetch: boolean;
  handleBackToSearch: () => void;
  handleBackToArtistList: () => void;
  handleSongSelect: (song: Song) => void;
  handleArtistSelect: (artist: Artist) => void;
  handleInputChange: (artistValue: string, songValue: string) => void;
  handleSearchSubmit: (artistValue: string, songValue: string) => void;
  handleLoadingChange: (isLoading: boolean) => void;
  handleClearSearch: () => void;
  setShouldFetch: (val: boolean) => void;
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
}
