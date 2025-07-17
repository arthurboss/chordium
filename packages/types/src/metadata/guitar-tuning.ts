/**
 * Guitar tuning types - shared between frontend and backend
 * Constants moved to frontend-specific constants/guitar-tunings.ts
 */

import type { Note } from './note.js';

export type GuitarTuning = [Note, Note, Note, Note, Note, Note];
