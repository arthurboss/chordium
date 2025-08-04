/**
 * Props interface for useSongActions hook
 */
import type { Song } from '@chordium/types';

export interface UseSongActionsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  memoizedSongs: Song[];
}
