import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS, GuitarTuning } from '@/constants/guitar-tunings';

/**
 * Legacy ChordSheet format for backwards compatibility
 */
export interface LegacyChordSheet {
  title: string;
  artist: string;
  chords: string;
  key?: string;
  tuning?: string;
  capo?: string | number;
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
    const tuningLower = legacy.tuning.toLowerCase().trim();
    
    // Try to match against known tuning names first
    if (tuningLower === 'standard') {
      guitarTuning = GUITAR_TUNINGS.STANDARD;
    } else if (tuningLower === 'drop_d' || tuningLower === 'drop d') {
      guitarTuning = GUITAR_TUNINGS.DROP_D;
    } else {
      // Try to match by tuning array values
      const tuningEntry = Object.entries(GUITAR_TUNINGS).find(([key, value]) => {
        return value.join(' ') === legacy.tuning || 
               value.join(' ').toLowerCase() === tuningLower;
      });
      
      if (tuningEntry) {
        guitarTuning = tuningEntry[1] as GuitarTuning;
      } else {
        // Try to parse as space-separated tuning
        const tuningParts = legacy.tuning.split(' ').map(s => s.trim()).filter(s => s.length > 0);
        if (tuningParts.length === 6) {
          guitarTuning = tuningParts as GuitarTuning;
        }
      }
    }
  }

  // Parse capo value whether it's string or number
  let guitarCapo = 0;
  if (legacy.capo !== undefined && legacy.capo !== null) {
    if (typeof legacy.capo === 'string') {
      const parsed = parseInt(legacy.capo.replace(/\D/g, ''), 10);
      guitarCapo = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    } else if (typeof legacy.capo === 'number') {
      guitarCapo = legacy.capo < 0 ? 0 : legacy.capo;
    }
  }

  return {
    title: legacy.title,
    artist: legacy.artist || 'Unknown Artist',
    songChords: legacy.chords,
    songKey: legacy.key || '',
    guitarTuning,
    guitarCapo
  };
};

/**
 * Transform new ChordSheet format to legacy format
 * @param chordSheet - New ChordSheet object
 * @returns Legacy ChordSheet object
 */
export const transformNewToLegacy = (chordSheet: ChordSheet): LegacyChordSheet => {
  // Convert guitar tuning array to string
  const tuningString = chordSheet.guitarTuning.join(' ');

  return {
    title: chordSheet.title,
    artist: chordSheet.artist,
    chords: chordSheet.songChords,
    key: chordSheet.songKey,
    tuning: tuningString,
    capo: chordSheet.guitarCapo > 0 ? chordSheet.guitarCapo : ''
  };
};

/**
 * Create a default ChordSheet object
 * @param overrides - Optional overrides for default values
 * @returns Default ChordSheet object
 */
export const createDefaultChordSheet = (overrides?: Partial<ChordSheet>): ChordSheet => {
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
 * Validate ChordSheet object
 * @param chordSheet - ChordSheet to validate
 * @returns True if valid, false otherwise
 */
export const validateChordSheet = (chordSheet: unknown): boolean => {
  if (!chordSheet || typeof chordSheet !== 'object') {
    return false;
  }

  const sheet = chordSheet as Record<string, unknown>;
  const errors: string[] = [];

  if (!sheet.title || typeof sheet.title !== 'string' || !sheet.title.trim()) {
    errors.push('Title is required');
  }

  if (!sheet.artist || typeof sheet.artist !== 'string' || !sheet.artist.trim()) {
    errors.push('Artist is required');
  }

  if (!sheet.songChords || typeof sheet.songChords !== 'string' || !sheet.songChords.trim()) {
    errors.push('Content is required');
  }

  if (sheet.guitarTuning) {
    const isValidTuning = Object.values(GUITAR_TUNINGS).some(tuning => 
      JSON.stringify(tuning) === JSON.stringify(sheet.guitarTuning)
    );
    if (!isValidTuning) {
      errors.push('Invalid tuning');
    }
  }

  if (sheet.guitarCapo && (typeof sheet.guitarCapo !== 'number' || sheet.guitarCapo < 0 || sheet.guitarCapo > 12)) {
    errors.push('Capo must be between 0 and 12');
  }

  return errors.length === 0;
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
