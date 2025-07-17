/**
 * Guitar tuning constants - frontend specific
 */

import type { GuitarTuning } from '@chordium/types';

export { type GuitarTuning } from '@chordium/types';

export const GUITAR_TUNINGS = {
  STANDARD: ['E', 'A', 'D', 'G', 'B', 'E'] as GuitarTuning,
  DROP_D: ['D', 'A', 'D', 'G', 'B', 'E'] as GuitarTuning,
  OPEN_G: ['D', 'G', 'D', 'G', 'B', 'D'] as GuitarTuning,
  HALF_STEP_DOWN: ['Eb', 'Ab', 'Db', 'Gb', 'Bb', 'Eb'] as GuitarTuning,
  DROP_C: ['C', 'G', 'C', 'F', 'A', 'D'] as GuitarTuning,
  DADGAD: ['D', 'A', 'D', 'G', 'A', 'D'] as GuitarTuning,
  OPEN_D: ['D', 'A', 'D', 'F#', 'A', 'D'] as GuitarTuning,
} as const;

export type TuningName = keyof typeof GUITAR_TUNINGS;
export type KnownTuning = typeof GUITAR_TUNINGS[TuningName];
