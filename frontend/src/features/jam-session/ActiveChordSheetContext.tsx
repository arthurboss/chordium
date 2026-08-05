import { createContext, useMemo, useState, type ReactNode } from 'react';
import type { ChordSheet, SongMetadata } from '@chordium/types';

export type ShareableChordSheet = ChordSheet & SongMetadata;

export interface ActiveShareable {
  /** The arrangement currently on screen. */
  chordSheet: ShareableChordSheet;
  /**
   * The simplified arrangement, when it differs from the displayed one. A QR
   * code cannot hold a long song, so this is the smaller fallback payload.
   */
  simplifiedChordSheet?: ShareableChordSheet;
  /** Route of the song, for the link-only fallback. */
  songPath: string;
}

export interface ActiveChordSheetContextValue {
  /** What is currently shareable, or null when nothing is. */
  active: ActiveShareable | null;
  /**
   * Publishes what the viewer is showing. Pass null to withdraw it, which the
   * viewer does while editing so unsaved text is never shared.
   */
  setActive: (active: ActiveShareable | null) => void;
}

export const ActiveChordSheetContext = createContext<ActiveChordSheetContextValue | undefined>(
  undefined
);

/**
 * Makes the chord sheet being viewed reachable from the app header.
 *
 * The header and the routed page are siblings in the layout tree, so the
 * header cannot receive the song by props. This lifts just that one value to a
 * shared ancestor instead of drilling it through every layer in between.
 */
export function ActiveChordSheetProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveShareable | null>(null);
  const value = useMemo(() => ({ active, setActive }), [active]);
  return (
    <ActiveChordSheetContext.Provider value={value}>{children}</ActiveChordSheetContext.Provider>
  );
}
