/**
 * Props interface for useSongActions hook
 */
import type { Song } from '@chordium/types';

export interface UseSongActionsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  memoizedSongs: Song[];
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
  // New prop for My Chord Sheets to enable deduplication
  myChordSheets?: Song[];
}
