import { ChordSheet } from '../types/chordSheet';
import { getCachedChordSheet, cacheChordSheet } from '../cache';
import {
  transformLegacyToNew,
  transformNewToLegacy,
  createDefaultChordSheet,
  validateChordSheet,
  LegacyChordSheet
} from '../utils/chordsheet-transformer';

/**
 * ChordSheet Service - Central hub for all chord sheet operations
 * SRP: Single responsibility for managing chord sheet data flow
 * DRY: Centralizes all chord sheet operations to avoid duplication
 */
export class ChordSheetService {
  /**
   * Retrieves a chord sheet from cache, ensuring it's in the new format
   * DRY: Single method for all chord sheet retrieval
   */
  static getChordSheet(songPath: string): ChordSheet | null {
    const cached = getCachedChordSheet(songPath);
    
    if (!cached) {
      return null;
    }

    // If it's already in new format, return as-is
    if (validateChordSheet(cached)) {
      return cached;
    }

    // If it's in legacy format, transform it
    if (this.isLegacyChordSheet(cached)) {
      const transformed = transformLegacyToNew(cached);
      // Update cache with new format
      this.saveChordSheet(songPath, transformed);
      return transformed;
    }

    return null;
  }

  /**
   * Saves a chord sheet to cache in the new format
   * SRP: Single responsibility for saving
   */
  static saveChordSheet(songPath: string, chordSheet: ChordSheet): void {
    cacheChordSheet(songPath, chordSheet);
  }

  /**
   * Creates a new chord sheet with defaults
   * DRY: Centralized creation with smart defaults
   */
  static createChordSheet(overrides: Partial<ChordSheet> = {}): ChordSheet {
    return createDefaultChordSheet(overrides);
  }

  /**
   * Converts legacy data to new format for migration purposes
   * SRP: Single responsibility for legacy migration
   */
  static migrateLegacyChordSheet(legacyData: LegacyChordSheet): ChordSheet {
    return transformLegacyToNew(legacyData);
  }

  /**
   * Converts new format to legacy for backward compatibility
   * SRP: Single responsibility for backward compatibility
   */
  static toLegacyFormat(chordSheet: ChordSheet): LegacyChordSheet {
    return transformNewToLegacy(chordSheet);
  }

  /**
   * Validates if data represents a valid chord sheet
   * SRP: Single responsibility for validation
   */
  static isValidChordSheet(data: unknown): data is ChordSheet {
    return validateChordSheet(data);
  }

  /**
   * Type guard to check if object is in legacy format
   * DRY: Centralized legacy format detection
   */
  private static isLegacyChordSheet(obj: unknown): obj is LegacyChordSheet {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    const legacy = obj as Record<string, unknown>;
    
    return (
      typeof legacy.title === 'string' &&
      typeof legacy.artist === 'string' &&
      typeof legacy.chords === 'string' && // Legacy uses 'chords' not 'songChords'
      typeof legacy.key === 'string' && // Legacy uses 'key' not 'songKey'
      (typeof legacy.tuning === 'string' || Array.isArray(legacy.tuning)) &&
      (typeof legacy.capo === 'string' || typeof legacy.capo === 'number')
    );
  }

  /**
   * Extracts chord sheet content for display components
   * DRY: Single method for content extraction
   */
  static getChordContent(chordSheet: ChordSheet | null): string {
    return chordSheet?.songChords ?? '';
  }

  /**
   * Gets display-friendly guitar tuning string
   * DRY: Single method for tuning display
   */
  static getTuningDisplay(chordSheet: ChordSheet | null): string {
    if (!chordSheet) return '';
    return chordSheet.guitarTuning.join(' ');
  }

  /**
   * Gets capo display string
   * DRY: Single method for capo display
   */
  static getCapoDisplay(chordSheet: ChordSheet | null): string {
    if (!chordSheet || chordSheet.guitarCapo === 0) {
      return 'No capo';
    }
    return `Capo ${chordSheet.guitarCapo}`;
  }

  /**
   * Checks if chord sheet has meaningful content
   * DRY: Single method for content validation
   */
  static hasContent(chordSheet: ChordSheet | null): boolean {
    return !!(chordSheet?.songChords && chordSheet.songChords.trim().length > 0);
  }

  /**
   * Gets song metadata for display
   * DRY: Single method for metadata extraction
   */
  static getMetadata(chordSheet: ChordSheet | null) {
    if (!chordSheet) {
      return {
        title: '',
        artist: 'Unknown Artist',
        key: '',
        tuning: '',
        capo: 'No capo',
        hasContent: false
      };
    }

    return {
      title: chordSheet.title,
      artist: chordSheet.artist,
      key: chordSheet.songKey || 'Unknown',
      tuning: this.getTuningDisplay(chordSheet),
      capo: this.getCapoDisplay(chordSheet),
      hasContent: this.hasContent(chordSheet)
    };
  }
}
