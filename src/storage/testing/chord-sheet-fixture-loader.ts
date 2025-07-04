import fs from 'fs';
import path from 'path';
import { ChordSheet } from '@/types/chordSheet';

/**
 * Chord sheet fixture loader for tests
 * Follows SRP: Single responsibility for loading chord sheet test data
 */
export class ChordSheetFixtureLoader {
  private static readonly FIXTURES_DIR = path.join(process.cwd(), 'public/data/songs');

  /**
   * Load chord sheet fixture by filename
   * @param filename - Name of the fixture file (without .json extension)
   * @returns Chord sheet data
   */
  static loadChordSheet(filename: string): ChordSheet {
    const filePath = path.join(this.FIXTURES_DIR, `${filename}.json`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fixture file not found: ${filename}.json`);
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as ChordSheet;
  }

  /**
   * Get all available chord sheet fixtures
   * @returns Array of available fixture names (without .json extension)
   */
  static getAvailableFixtures(): string[] {
    if (!fs.existsSync(this.FIXTURES_DIR)) {
      return [];
    }
    
    return fs.readdirSync(this.FIXTURES_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }

  /**
   * Load multiple chord sheet fixtures
   * @param filenames - Array of fixture filenames
   * @returns Array of chord sheet data
   */
  static loadMultipleChordSheets(filenames: string[]): ChordSheet[] {
    return filenames.map(filename => this.loadChordSheet(filename));
  }
}
