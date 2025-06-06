import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Fixture loader utility for test data
 */
class FixtureLoader {
  constructor() {
    this.fixtures = new Map();
  }

  /**
   * Load a fixture file
   * @param {string} fixtureName - Name of fixture file (without .json extension)
   * @returns {Object} Parsed fixture data
   */
  load(fixtureName) {
    if (this.fixtures.has(fixtureName)) {
      return this.fixtures.get(fixtureName);
    }

    try {
      const fixturePath = join(__dirname, `${fixtureName}.json`);
      const fixtureData = JSON.parse(readFileSync(fixturePath, 'utf8'));
      this.fixtures.set(fixtureName, fixtureData);
      return fixtureData;
    } catch (error) {
      throw new Error(`Failed to load fixture '${fixtureName}': ${error.message}`);
    }
  }

  /**
   * Get song search fixtures
   * @returns {Object} Song search fixtures
   */
  getSongSearchFixtures() {
    return this.load('song-search');
  }

  /**
   * Get artist search fixtures
   * @returns {Object} Artist search fixtures
   */
  getArtistSearchFixtures() {
    return this.load('artist-search');
  }

  /**
   * Get artist songs fixtures
   * @returns {Object} Artist songs fixtures
   */
  getArtistSongsFixtures() {
    return this.load('artist-songs');
  }

  /**
   * Get chord sheets fixtures
   * @returns {Object} Chord sheets fixtures
   */
  getChordSheetsFixtures() {
    return this.load('chord-sheets');
  }

  /**
   * Get specific song search result
   * @param {string} query - Search query (e.g., 'wonderwall', 'creep')
   * @returns {Array} Search results for the query
   */
  getSongSearchResult(query) {
    const fixtures = this.getSongSearchFixtures();
    return fixtures[query.toLowerCase()] || [];
  }

  /**
   * Get specific artist search result
   * @param {string} query - Search query (e.g., 'radiohead', 'oasis')
   * @returns {Array} Search results for the query
   */
  getArtistSearchResult(query) {
    const fixtures = this.getArtistSearchFixtures();
    return fixtures[query.toLowerCase()] || [];
  }

  /**
   * Get specific artist songs
   * @param {string} artistPath - Artist path (e.g., 'radiohead', 'oasis')
   * @returns {Array} Songs for the artist
   */
  getArtistSongs(artistPath) {
    const fixtures = this.getArtistSongsFixtures();
    return fixtures[artistPath.toLowerCase()] || [];
  }

  /**
   * Get specific chord sheet
   * @param {string} songKey - Song key (e.g., 'wonderwall', 'creep')
   * @returns {Object} Chord sheet data
   */
  getChordSheet(songKey) {
    const fixtures = this.getChordSheetsFixtures();
    return fixtures[songKey.toLowerCase()] || null;
  }

  /**
   * Clear cached fixtures (useful for testing)
   */
  clearCache() {
    this.fixtures.clear();
  }
}

// Export singleton instance
export default new FixtureLoader();

/**
 * Convenience functions for direct access
 */
export const getSongSearchFixtures = () => new FixtureLoader().getSongSearchFixtures();
export const getArtistSearchFixtures = () => new FixtureLoader().getArtistSearchFixtures();
export const getArtistSongsFixtures = () => new FixtureLoader().getArtistSongsFixtures();
export const getChordSheetsFixtures = () => new FixtureLoader().getChordSheetsFixtures();
export const getSongSearchResult = (query) => new FixtureLoader().getSongSearchResult(query);
export const getArtistSearchResult = (query) => new FixtureLoader().getArtistSearchResult(query);
export const getArtistSongs = (artistPath) => new FixtureLoader().getArtistSongs(artistPath);
export const getChordSheet = (songKey) => new FixtureLoader().getChordSheet(songKey);
