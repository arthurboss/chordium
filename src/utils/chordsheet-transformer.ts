import { ChordSheet } from '../types/chordSheet';
import { GUITAR_TUNINGS, GuitarTuning } from '../types/guitarTuning';

/**
 * Legacy ChordSheet format (old structure)
 */
export interface LegacyChordSheet {
  title: string;
  artist: string;
  chords: string;
  key: string;
  tuning: string;
  capo: string | number;
}

/**
 * Converts a legacy ChordSheet to the new ChordSheet format
 * Single Responsibility: Only handles ChordSheet format transformation
 */
export const transformLegacyToNew = (legacy: LegacyChordSheet): ChordSheet => {
  return {
    title: legacy.title || '',
    artist: legacy.artist || 'Unknown Artist',
    songChords: legacy.chords || '',
    songKey: legacy.key || '',
    guitarTuning: parseGuitarTuning(legacy.tuning),
    guitarCapo: parseCapo(legacy.capo)
  };
};

/**
 * Converts a new ChordSheet to legacy format for backward compatibility
 * Single Responsibility: Only handles reverse transformation
 */
export const transformNewToLegacy = (chordSheet: ChordSheet): LegacyChordSheet => {
  return {
    title: chordSheet.title,
    artist: chordSheet.artist,
    chords: chordSheet.songChords,
    key: chordSheet.songKey,
    tuning: formatGuitarTuning(chordSheet.guitarTuning),
    capo: chordSheet.guitarCapo
  };
};

/**
 * Parses tuning string/array to GuitarTuning type
 * DRY: Centralized tuning parsing logic
 */
const parseGuitarTuning = (tuning: string | string[] | GuitarTuning): GuitarTuning => {
  // If already a GuitarTuning array, return as-is
  if (Array.isArray(tuning) && tuning.length === 6) {
    return tuning as GuitarTuning;
  }

  // If string, try to parse it
  if (typeof tuning === 'string') {
    // Handle common named tunings
    const upperTuning = tuning.toUpperCase().replace(/\s+/g, '_');
    const knownTuning = Object.entries(GUITAR_TUNINGS).find(
      ([name]) => name === upperTuning
    );
    
    if (knownTuning) {
      return knownTuning[1];
    }

    // Try to parse space-separated format: "E A D G B E"
    const parts = tuning.trim().split(/\s+/);
    if (parts.length === 6) {
      return parts as GuitarTuning;
    }
  }

  // Default to standard tuning
  return GUITAR_TUNINGS.STANDARD;
};

/**
 * Formats GuitarTuning to string representation
 * DRY: Centralized tuning formatting logic
 */
const formatGuitarTuning = (tuning: GuitarTuning): string => {
  return tuning.join(' ');
};

/**
 * Parses capo value to number
 * DRY: Centralized capo parsing logic
 */
const parseCapo = (capo: string | number | undefined): number => {
  if (typeof capo === 'number') {
    return Math.max(0, Math.floor(capo));
  }

  if (typeof capo === 'string') {
    // Handle formats like "2", "Capo 2", "2nd fret", etc.
    const regex = /(\d+)/;
    const match = regex.exec(capo);
    if (match) {
      return Math.max(0, parseInt(match[1], 10));
    }
  }

  return 0; // Default: no capo
};

/**
 * Creates a default ChordSheet with standard values
 * DRY: Centralized default creation
 */
export const createDefaultChordSheet = (overrides: Partial<ChordSheet> = {}): ChordSheet => {
  return {
    title: '',
    artist: 'Unknown Artist',
    songChords: '',
    songKey: '',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0,
    ...overrides
  };
};

/**
 * Validates that a ChordSheet object has all required properties
 * SRP: Single responsibility for validation
 */
export const validateChordSheet = (chordSheet: unknown): chordSheet is ChordSheet => {
  if (typeof chordSheet !== 'object' || chordSheet === null) {
    return false;
  }

  const obj = chordSheet as Record<string, unknown>;
  
  return (
    typeof obj.title === 'string' &&
    typeof obj.artist === 'string' &&
    typeof obj.songChords === 'string' &&
    typeof obj.songKey === 'string' &&
    Array.isArray(obj.guitarTuning) &&
    obj.guitarTuning.length === 6 &&
    typeof obj.guitarCapo === 'number'
  );
};
