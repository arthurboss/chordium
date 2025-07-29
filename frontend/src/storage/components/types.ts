/**
 * Type definitions for My Chord Sheets viewer component
 */

import type { Song } from '@chordium/types';

export interface MyChordSheetsViewerProps {
  /** Selected song to display */
  readonly selectedSong: Song;
  /** Reference to chord display element */
  readonly chordDisplayRef: React.RefObject<HTMLDivElement>;
  /** Callback when back button is clicked */
  readonly onBack: () => void;
  /** Callback when delete button is clicked */
  readonly onDelete: (songPath: string) => void;
  /** Callback when chord sheet content is updated */
  readonly onUpdate: (content: string) => void;
}
