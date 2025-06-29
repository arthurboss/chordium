import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS, GuitarTuning, KnownTuning } from '@/types/guitarTuning';

/**
 * Legacy ChordSheet format for backwards compatibility
 */
export interface LegacyChordSheet {
  title: string;
  artist: string;
  chords: string;
  key?: string;
  tuning?: string;
  capo?: string;
  bpm?: number;
  strumming?: string;
  notes?: string;
}

/**
 * Transform legacy ChordSheet format to new format
 * @param legacy - Legacy ChordSheet object
 * @returns New ChordSheet object
 */
export const transformLegacyToNew = (legacy: LegacyChordSheet): ChordSheet => {
  // Find matching tuning or default to standard
  let guitarTuning: GuitarTuning = GUITAR_TUNINGS.STANDARD;
  if (legacy.tuning) {
    const tuningEntry = Object.entries(GUITAR_TUNINGS).find(([_, value]) => 
      value.join('-') === legacy.tuning || 
      legacy.tuning.toLowerCase().includes(Object.keys(GUITAR_TUNINGS).find(key => key.toLowerCase().replace('_', ' ') === legacy.tuning?.toLowerCase())?.toLowerCase() || '')
    );
    if (tuningEntry) {
      guitarTuning = tuningEntry[1] as GuitarTuning;
    }
  }

  return {
    title: legacy.title,
    artist: legacy.artist,
    songChords: legacy.chords,
    songKey: legacy.key || '',
    guitarTuning,
    guitarCapo: legacy.capo ? parseInt(legacy.capo.replace(/\D/g, ''), 10) || 0 : 0
  };
};

/**
 * Transform new ChordSheet format to legacy format
 * @param chordSheet - New ChordSheet object
 * @returns Legacy ChordSheet object
 */
export const transformNewToLegacy = (chordSheet: ChordSheet): LegacyChordSheet => {
  // Find tuning name
  const tuningName = Object.entries(GUITAR_TUNINGS).find(([_, value]) => 
    JSON.stringify(value) === JSON.stringify(chordSheet.guitarTuning)
  )?.[0] || 'STANDARD';

  return {
    title: chordSheet.title,
    artist: chordSheet.artist,
    chords: chordSheet.songChords,
    key: chordSheet.songKey,
    tuning: tuningName.replace('_', ' ').toLowerCase(),
    capo: chordSheet.guitarCapo > 0 ? `Capo ${chordSheet.guitarCapo}` : ''
  };
};

/**
 * Create a default ChordSheet object
 * @param title - Song title
 * @param artist - Artist name
 * @returns Default ChordSheet object
 */
export const createDefaultChordSheet = (title: string, artist: string): ChordSheet => {
  return {
    title,
    artist,
    songChords: '',
    songKey: '',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  };
};

/**
 * Validate ChordSheet object
 * @param chordSheet - ChordSheet to validate
 * @returns Validation result
 */
export const validateChordSheet = (chordSheet: ChordSheet): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!chordSheet.title?.trim()) {
    errors.push('Title is required');
  }

  if (!chordSheet.artist?.trim()) {
    errors.push('Artist is required');
  }

  if (!chordSheet.songChords?.trim()) {
    errors.push('Content is required');
  }

  if (chordSheet.guitarTuning) {
    const isValidTuning = Object.values(GUITAR_TUNINGS).some(tuning => 
      JSON.stringify(tuning) === JSON.stringify(chordSheet.guitarTuning)
    );
    if (!isValidTuning) {
      errors.push('Invalid tuning');
    }
  }

  if (chordSheet.guitarCapo && (chordSheet.guitarCapo < 0 || chordSheet.guitarCapo > 12)) {
    errors.push('Capo must be between 0 and 12');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Clean ChordSheet content by removing extra whitespace and normalizing line breaks
 * @param content - Raw chord sheet content
 * @returns Cleaned content
 */
export const cleanChordContent = (content: string): string => {
  return content
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive blank lines
    .trim();
};

/**
 * Extract chord progressions from chord sheet content
 * @param content - Chord sheet content
 * @returns Array of chord progressions
 */
export const extractChordProgressions = (content: string): string[] => {
  const chordRegex = /\[([A-G][#b]?[^|\]]*)\]/g;
  const matches = content.match(chordRegex);
  return matches ? matches.map(match => match.slice(1, -1)) : [];
};

/**
 * Get unique chords from chord sheet content
 * @param content - Chord sheet content
 * @returns Array of unique chords
 */
export const getUniqueChords = (content: string): string[] => {
  const chords = extractChordProgressions(content);
  return [...new Set(chords)].sort((a, b) => a.localeCompare(b));
};
