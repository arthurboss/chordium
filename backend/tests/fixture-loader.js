/**
 * Backend Fixture Loader
 * 
 * Centralized fixture management for backend unit and integration tests.
 * Provides access to test data that matches backend API responses and data structures.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backend fixtures directory
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

/**
 * Backend Fixture Loader Class
 * Loads and caches fixtures for consistent test data across backend tests
 */
export class BackendFixtureLoader {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Load a fixture file from the fixtures directory
   * @param {string} filename - The fixture filename (without .json extension)
   * @returns {Object} The parsed fixture data
   */
  loadFixture(filename) {
    const cacheKey = filename;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const filePath = path.join(FIXTURES_DIR, `${filename}.json`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to load backend fixture: ${filename}`, error);
      return null;
    }
  }

  /**
   * Get song search fixture data
   * @param {string} query - The search query key
   * @returns {Array} Song search results
   */
  getSongSearchResult(query) {
    const fixtures = this.loadFixture('song-search');
    return fixtures?.[query] || [];
  }

  /**
   * Get artist search fixture data
   * @param {string} query - The search query key
   * @returns {Array} Artist search results
   */
  getArtistSearchResult(query) {
    const fixtures = this.loadFixture('artist-search');
    return fixtures?.[query] || [];
  }

  /**
   * Get artist songs fixture data
   * @param {string} artistPath - The artist path key
   * @returns {Array} Artist songs list
   */
  getArtistSongs(artistPath) {
    const fixtures = this.loadFixture('artist-songs');
    return fixtures?.[artistPath] || [];
  }

  /**
   * Get chord sheet fixture data from actual song files
   * @param {string} songKey - The song identifier key (e.g., 'wonderwall', 'creep', 'hotel_california')
   * @returns {Object} Chord sheet content with path and chords
   */
  getChordSheet(songKey) {
    try {
      // Map song keys to actual file names
      const songFileMap = {
        'wonderwall': 'oasis-wonderwall.json',
        'creep': 'radiohead-creep.json',
        'hotel_california': 'eagles-hotel_california.json'
      };

      const fileName = songFileMap[songKey];
      if (!fileName) {
        console.warn(`No song file mapping found for key: ${songKey}`);
        return null;
      }

      // Load from public/data/songs/ directory
      const songFilePath = path.join(__dirname, '../../public/data/songs/', fileName);
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
   * @returns {Array} Raw search results as they come from scraping
   */
  getCifraClubSearchResults() {
    return this.loadFixture('cifraclub-search') || [];
  }

  /**
   * Get artists list
   * @returns {Array} Artists list
   */
  getArtists() {
    return this.loadFixture('artists') || [];
  }

  /**
   * Clear the fixture cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache information
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create and export backend fixture loader instance
const backendFixtureLoader = new BackendFixtureLoader();

// Export convenience functions for direct access
export const getSongSearchResult = (query) => backendFixtureLoader.getSongSearchResult(query);
export const getArtistSearchResult = (query) => backendFixtureLoader.getArtistSearchResult(query);
export const getArtistSongs = (artistPath) => backendFixtureLoader.getArtistSongs(artistPath);
export const getChordSheet = (songKey) => backendFixtureLoader.getChordSheet(songKey);
export const getCifraClubSearchResults = () => backendFixtureLoader.getCifraClubSearchResults();
export const getArtists = () => backendFixtureLoader.getArtists();

// Export the instance as default
export default backendFixtureLoader;
