/**
 * Global Fixture Loader
 * 
 * Centralized fixture management for both backend unit tests and frontend E2E tests.
 * Provides a single source of truth for all test data across the entire application.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global fixtures directories
const API_FIXTURES_DIR = path.join(__dirname, 'api');
const E2E_FIXTURES_DIR = path.join(__dirname, 'e2e');

/**
 * Global Fixture Loader Class
 * Loads and caches fixtures for consistent test data across backend and frontend
 */
export class GlobalFixtureLoader {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Load a fixture file from the API fixtures directory
   * @param {string} filename - The fixture filename (without .json extension)
   * @returns {Object} The parsed fixture data
   */
  loadApiFixture(filename) {
    const cacheKey = `api:${filename}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const filePath = path.join(API_FIXTURES_DIR, `${filename}.json`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to load API fixture: ${filename}`, error);
      return null;
    }
  }

  /**
   * Load a fixture file from the E2E fixtures directory
   * @param {string} filename - The fixture filename (without .json extension)
   * @returns {Object} The parsed fixture data
   */
  loadE2eFixture(filename) {
    const cacheKey = `e2e:${filename}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const filePath = path.join(E2E_FIXTURES_DIR, `${filename}.json`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to load E2E fixture: ${filename}`, error);
      return null;
    }
  }

  /**
   * Get song search fixture data
   * @param {string} query - The search query key
   * @returns {Array} Song search results
   */
  getSongSearchResult(query) {
    const fixtures = this.loadApiFixture('song-search');
    return fixtures?.[query] || [];
  }

  /**
   * Get artist search fixture data
   * @param {string} query - The search query key
   * @returns {Array} Artist search results
   */
  getArtistSearchResult(query) {
    const fixtures = this.loadApiFixture('artist-search');
    return fixtures?.[query] || [];
  }

  /**
   * Get artist songs fixture data
   * @param {string} artistPath - The artist path key
   * @returns {Array} Artist songs list
   */
  getArtistSongs(artistPath) {
    const fixtures = this.loadApiFixture('artist-songs');
    return fixtures?.[artistPath] || [];
  }

  /**
   * Get chord sheet fixture data
   * @param {string} songKey - The song identifier key
   * @returns {Object} Chord sheet content
   */
  getChordSheet(songKey) {
    const fixtures = this.loadApiFixture('chord-sheets');
    return fixtures?.[songKey] || null;
  }

  /**
   * Get all song search fixtures
   * @returns {Object} All song search fixture data
   */
  getSongSearchFixtures() {
    return this.loadApiFixture('song-search');
  }

  /**
   * Get all artist search fixtures
   * @returns {Object} All artist search fixture data
   */
  getArtistSearchFixtures() {
    return this.loadApiFixture('artist-search');
  }

  /**
   * Get all artist songs fixtures
   * @returns {Object} All artist songs fixture data
   */
  getArtistSongsFixtures() {
    return this.loadApiFixture('artist-songs');
  }

  /**
   * Get all chord sheet fixtures
   * @returns {Object} All chord sheet fixture data
   */
  getChordSheetFixtures() {
    return this.loadApiFixture('chord-sheets');
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

// Create and export global fixture loader instance
const globalFixtureLoader = new GlobalFixtureLoader();

// Export convenience functions for direct access
export const getSongSearchResult = (query) => globalFixtureLoader.getSongSearchResult(query);
export const getArtistSearchResult = (query) => globalFixtureLoader.getArtistSearchResult(query);
export const getArtistSongs = (artistPath) => globalFixtureLoader.getArtistSongs(artistPath);
export const getChordSheet = (songKey) => globalFixtureLoader.getChordSheet(songKey);

// Export the instance as default
export default globalFixtureLoader;
