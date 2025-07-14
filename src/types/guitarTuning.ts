import { Note } from './note';

export type GuitarTuning = [Note, Note, Note, Note, Note, Note];

export const GUITAR_TUNINGS = {
  STANDARD: ['E', 'A', 'D', 'G', 'B', 'E'],
  DROP_D: ['D', 'A', 'D', 'G', 'B', 'E'],
  OPEN_G: ['D', 'G', 'D', 'G', 'B', 'D'],
  HALF_STEP_DOWN: ['Eb', 'Ab', 'Db', 'Gb', 'Bb', 'Eb'],
  DROP_C: ['C', 'G', 'C', 'F', 'A', 'D'],
  DADGAD: ['D', 'A', 'D', 'G', 'A', 'D'],
  OPEN_D: ['D', 'A', 'D', 'F#', 'A', 'D'],
} as const satisfies Record<string, GuitarTuning>;

export type TuningName = keyof typeof GUITAR_TUNINGS;
export type KnownTuning = typeof GUITAR_TUNINGS[TuningName];