/**
 * Guitar tuning types - shared between frontend and backend
 * Constants moved to frontend-specific constants/guitar-tunings.ts
 */

import type { Note } from './note.js';

/**
 * Represents a 6-string guitar tuning as an array of notes.
 * Array indices correspond to guitar strings from lowest (thickest) to highest (thinnest):
 * [0] = 6th string (low E in standard tuning)
 * [1] = 5th string (A in standard tuning) 
 * [2] = 4th string (D in standard tuning)
 * [3] = 3rd string (G in standard tuning)
 * [4] = 2nd string (B in standard tuning)
 * [5] = 1st string (high E in standard tuning)
 * 
 * @example
 * ```typescript
 * const standardTuning: GuitarTuning = ['E', 'A', 'D', 'G', 'B', 'E'];
 * const dropD: GuitarTuning = ['D', 'A', 'D', 'G', 'B', 'E'];
 * ```
 */
export type GuitarTuning = [Note, Note, Note, Note, Note, Note];
