/**
 * Backend Fixture Loader
 * 
 * Centralized fixture management for backend unit and integration tests.
 * Provides access to test data that matches backend API responses and data structures.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Song, Artist } from '../../shared/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backend fixtures directory
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

/**
 * Interface for chord sheet fixture data
 */
interface ChordSheetFixture {
  path: string;
  content: string;
  title: string;
  artist: string;
}

/**
 * Interface for cache statistics
 */
interface CacheStats {
  size: number;
  keys: string[];
}

/**
 * Type for fixture data (can be any JSON-serializable data)
 */
type FixtureData = Record<string, unknown> | unknown[] | string | number | boolean | null;

/**
 * Backend Fixture Loader Class
 * Loads and caches fixtures for consistent test data across backend tests
 */
export class BackendFixtureLoader {
  private readonly cache: Map<string, FixtureData>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Load a fixture file from the fixtures directory
   * @param filename - The fixture filename (without .json extension)
   * @returns The parsed fixture data
   */
  loadFixture(filename: string): FixtureData {
    const cacheKey = filename;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const filePath = path.join(FIXTURES_DIR, `${filename}.json`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent) as FixtureData;
      
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to load backend fixture: ${filename}`, error);
      return null;
    }
  }

  /**
   * Get song search fixture data
   * @param query - The search query key
   * @returns Song search results
   */
  getSongSearchResult(query: string): Song[] {
    const fixtures = this.loadFixture('song-search') as Record<string, Song[]> | null;
    return fixtures?.[query] || [];
  }

  /**
   * Get artist search fixture data
   * @param query - The search query key
   * @returns Artist search results
   */
  getArtistSearchResult(query: string): Artist[] {
    const fixtures = this.loadFixture('artist-search') as Record<string, Artist[]> | null;
    return fixtures?.[query] || [];
  }

  /**
   * Get artist songs fixture data
   * @param artistPath - The artist path key
   * @returns Artist songs list
   */
  getArtistSongs(artistPath: string): Song[] {
    const fixtures = this.loadFixture('artist-songs') as Record<string, Song[]> | null;
    return fixtures?.[artistPath] || [];
  }

  /**
   * Get chord sheet fixture data from actual song files
   * @param songKey - The song identifier key (e.g., 'wonderwall', 'creep', 'hotel_california')
   * @returns Chord sheet content with path and chords
   */
  getChordSheet(songKey: string): ChordSheetFixture | null {
    try {
      // Map song keys to actual file names
      const songFileMap: Record<string, string> = {
        'wonderwall': 'oasis-wonderwall.json',
        'creep': 'radiohead-creep.json',
        'hotel_california': 'eagles-hotel_california.json'
      };

      const fileName = songFileMap[songKey];
      if (!fileName) {
        console.warn(`No song file mapping found for key: ${songKey}`);
        return null;
      }

      // Load from shared fixtures directory
      const songFilePath = path.join(__dirname, '../../shared/fixtures/chord-sheet/', fileName);
      const fileContent = fs.readFileSync(songFilePath, 'utf8');
      const songData = JSON.parse(fileContent);

      // Generate path from artist and title since it's not in the ChordSheet interface
      const artistSlug = songData.artist.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/(^-)|(-$)/g, '');
      const titleSlug = songData.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/(^-)|(-$)/g, '');
      const generatedPath = `${artistSlug}/${titleSlug}`;

      // Return in the format expected by tests
      return {
        path: generatedPath,
        content: songData.songChords || songData.chords || songData.lyrics || '',
        title: songData.title,
        artist: songData.artist
      };
    } catch (error) {
      console.error(`Failed to load chord sheet for ${songKey}:`, error);
      return null;
    }
  }

  /**
   * Get CifraClub search results (raw scraped data format)
   * @returns Raw search results as they come from scraping
   */
  getCifraClubSearchResults(): unknown[] {
    const fixtures = this.loadFixture('cifraclub-search');
    return Array.isArray(fixtures) ? fixtures : [];
  }

  /**
   * Get artists list
   * @returns Artists list
   */
  getArtists(): Artist[] {
    const fixtures = this.loadFixture('artists');
    return Array.isArray(fixtures) ? fixtures as Artist[] : [];
  }

  /**
   * Clear the fixture cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns Cache information
   */
  getCacheStats(): CacheStats {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create and export backend fixture loader instance
const backendFixtureLoader = new BackendFixtureLoader();

// Export convenience functions for direct access
export const getSongSearchResult = (query: string): Song[] => backendFixtureLoader.getSongSearchResult(query);
export const getArtistSearchResult = (query: string): Artist[] => backendFixtureLoader.getArtistSearchResult(query);
export const getArtistSongs = (artistPath: string): Song[] => backendFixtureLoader.getArtistSongs(artistPath);
export const getChordSheet = (songKey: string): ChordSheetFixture | null => backendFixtureLoader.getChordSheet(songKey);
export const getCifraClubSearchResults = (): unknown[] => backendFixtureLoader.getCifraClubSearchResults();
export const getArtists = (): Artist[] => backendFixtureLoader.getArtists();

// Export the instance as default
export default backendFixtureLoader;
