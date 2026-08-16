/**
 * Props interface for SearchResults component
 */
import type { Artist, Song } from '@chordium/types';

export interface SearchResultsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
  myChordSheets?: Song[];
  /** The search that produced these results. */
  query: string;
  /** Narrows an open artist's song list as the field is typed in. */
  filter: string;
  activeArtist: Artist | null;
  onArtistSelect: (artist: Artist) => void;
  shouldFetch?: boolean;
  onFetchComplete?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  /** Forwarded to the results card's back button. */
  onBackClick?: () => void;
  /** Forwarded to the results card's clear (trash) button. */
  onClearSearch?: () => void;
  clearDisabled?: boolean;
}
