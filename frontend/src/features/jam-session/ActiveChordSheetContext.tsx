import { createContext, useMemo, useState, type ReactNode } from 'react';
import type { ChordSheet, SongMetadata } from '@chordium/types';

export type ShareableChordSheet = ChordSheet & SongMetadata;

export interface ActiveChordSheetContextValue {
  /** The chord sheet currently on screen, or null when none is shareable. */
  chordSheet: ShareableChordSheet | null;
  /**
   * Publishes the chord sheet the viewer is showing. Pass null to withdraw it,
   * which the viewer does while editing so unsaved text is never shared.
   */
  setChordSheet: (chordSheet: ShareableChordSheet | null) => void;
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
  const [chordSheet, setChordSheet] = useState<ShareableChordSheet | null>(null);
  const value = useMemo(() => ({ chordSheet, setChordSheet }), [chordSheet]);
  return (
    <ActiveChordSheetContext.Provider value={value}>{children}</ActiveChordSheetContext.Provider>
  );
}
