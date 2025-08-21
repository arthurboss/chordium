/**
 * Props interface for SearchResults component
 */
import type { Artist, Song } from '@chordium/types';

export interface SearchResultsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
  myChordSheets?: Song[];
  artist: string;
  song: string;
  filterArtist: string;
  filterSong: string;
  activeArtist: Artist | null;
  onArtistSelect: (artist: Artist) => void;
  shouldFetch?: boolean;
  onFetchComplete?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}
