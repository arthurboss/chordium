import { jest } from '@jest/globals';
import backendFixtureLoader, { 
  getSongSearchResult, 
  getArtistSearchResult, 
  getArtistSongs, 
  getChordSheet 
} from '../fixture-loader.js';

// Mock the actual service to demonstrate replacing real calls with fixture data
const mockCifraClubService = {
  search: jest.fn(),
  getArtistSongs: jest.fn(),
  getChordSheet: jest.fn()
};

jest.unstable_mockModule('../../services/cifraclub.service.js', () => ({
  default: mockCifraClubService
}));

describe('Example: Using Fixtures Instead of Real API Calls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Song Search with Fixtures', () => {
    it('should use fixture data for Wonderwall search', async () => {
      // BEFORE: This would make a real API call
      // const results = await cifraClubService.search('wonderwall', 'song');
      
      // AFTER: Use fixture data instead
      const fixtureResults = getSongSearchResult('wonderwall');
      mockCifraClubService.search.mockResolvedValue(fixtureResults);
      
      // Simulate the API call
      const results = await mockCifraClubService.search('wonderwall', 'song');
      
      // Verify we got the expected fixture data
      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({
        title: 'Wonderwall',
        url: 'https://www.cifraclub.com.br/oasis/wonderwall/',
        artist: 'Oasis'
      });
      expect(results[1]).toEqual({
        title: 'Wonderwall Live',
        url: 'https://www.cifraclub.com.br/noel-gallagher/wonderwall-live/',
        artist: 'Noel Gallagher'
      });
      expect(results[2]).toEqual({
        title: 'Wonderwall (Español)',
        url: 'https://www.cifraclub.com.br/oasis/wonderwall-espaol/',
        artist: 'Oasis'
      });
    });

    it('should use fixture data for Creep search', async () => {
      const fixtureResults = getSongSearchResult('creep');
      mockCifraClubService.search.mockResolvedValue(fixtureResults);
      
      const results = await mockCifraClubService.search('creep', 'song');
      
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        title: 'Creep',
        url: 'https://www.cifraclub.com.br/radiohead/creep/',
        artist: 'Radiohead'
      });
      expect(results[1]).toEqual({
        title: 'Creep (Acoustic Version)',
        url: 'https://www.cifraclub.com.br/radiohead/creep-acoustic/',
        artist: 'Radiohead'
      });
    });
  });

  describe('Artist Search with Fixtures', () => {
    it('should use fixture data for Radiohead search', async () => {
      const fixtureResults = getArtistSearchResult('radiohead');
      mockCifraClubService.search.mockResolvedValue(fixtureResults);
      
      const results = await mockCifraClubService.search('radiohead', 'artist');
      
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        displayName: 'Radiohead',
        path: 'radiohead/',
        songCount: null
      });
    });

    it('should use fixture data for Oasis search', async () => {
      const fixtureResults = getArtistSearchResult('oasis');
      mockCifraClubService.search.mockResolvedValue(fixtureResults);
      
      const results = await mockCifraClubService.search('oasis', 'artist');
      
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        displayName: 'Oasis',
        path: 'oasis/',
        songCount: null
      });
    });
  });

  describe('Artist Songs with Fixtures', () => {
    it('should use fixture data for Radiohead songs', async () => {
      const fixtureResults = getArtistSongs('radiohead');
      mockCifraClubService.getArtistSongs.mockResolvedValue(fixtureResults);
      
      const results = await mockCifraClubService.getArtistSongs('https://www.cifraclub.com.br/radiohead/');
      
      expect(results).toHaveLength(8);
      expect(results[0]).toEqual({
        title: 'Creep',
        url: 'https://www.cifraclub.com.br/radiohead/creep/'
      });
      expect(results[1]).toEqual({
        title: 'No Surprises',
        url: 'https://www.cifraclub.com.br/radiohead/no-surprises/'
      });
    });

    it('should use fixture data for Oasis songs', async () => {
      const fixtureResults = getArtistSongs('oasis');
      mockCifraClubService.getArtistSongs.mockResolvedValue(fixtureResults);
      
      const results = await mockCifraClubService.getArtistSongs('https://www.cifraclub.com.br/oasis/');
      
      expect(results).toHaveLength(12);
      expect(results[0]).toEqual({
        title: 'Wonderwall',
        url: 'https://www.cifraclub.com.br/oasis/wonderwall/'
      });
      expect(results[1]).toEqual({
        title: "Don't Look Back in Anger",
        url: 'https://www.cifraclub.com.br/oasis/dont-look-back-in-anger/'
      });
    });
  });

  describe('Chord Sheets with Fixtures', () => {
    it('should use fixture data for Wonderwall chord sheet', async () => {
      const fixtureResult = getChordSheet('wonderwall');
      mockCifraClubService.getChordSheet.mockResolvedValue(fixtureResult.content);
      
      const result = await mockCifraClubService.getChordSheet('https://www.cifraclub.com.br/oasis/wonderwall/');
      
      expect(result).toContain('Today is gonna be the day');
      expect(result).toContain("That they're gonna");
      expect(result).toContain('Throw it back to you');
      expect(result).toContain('By now you should\'ve somehow');
    });

    it('should use fixture data for Creep chord sheet', async () => {
      const fixtureResult = getChordSheet('creep');
      mockCifraClubService.getChordSheet.mockResolvedValue(fixtureResult.content);
      
      const result = await mockCifraClubService.getChordSheet('https://www.cifraclub.com.br/radiohead/creep/');
      
      expect(result).toContain('When you were here before');
      expect(result).toContain("Couldn't look you in the eye");
      expect(result).toContain("You're just like an angel");
      expect(result).toContain('Your skin makes me cry');
    });
  });

  describe('Fixture Loader Direct Usage', () => {
    it('should load all fixture types using the loader instance', () => {
      const songFixtures = backendFixtureLoader.loadFixture('song-search');
      const artistFixtures = backendFixtureLoader.loadFixture('artist-search');
      const artistSongsFixtures = backendFixtureLoader.loadFixture('artist-songs');
      const chordSheetsFixtures = backendFixtureLoader.loadFixture('chord-sheets');
      
      // Verify fixture structure
      expect(songFixtures).toHaveProperty('wonderwall');
      expect(songFixtures).toHaveProperty('creep');
      expect(artistFixtures).toHaveProperty('radiohead');
      expect(artistFixtures).toHaveProperty('oasis');
      expect(artistSongsFixtures).toHaveProperty('radiohead');
      expect(artistSongsFixtures).toHaveProperty('oasis');
      expect(chordSheetsFixtures).toHaveProperty('wonderwall');
      expect(chordSheetsFixtures).toHaveProperty('creep');
    });

    it('should cache loaded fixtures', () => {
      // First load
      const fixtures1 = backendFixtureLoader.loadFixture('song-search');
      // Second load (should use cache)
      const fixtures2 = backendFixtureLoader.loadFixture('song-search');
      
      // Should be the same reference (cached)
      expect(fixtures1).toBe(fixtures2);
    });

    it('should clear cache when requested', () => {
      backendFixtureLoader.loadFixture('song-search'); // Load into cache
      backendFixtureLoader.clearCache();
      
      // Should reload from file
      const fixtures = backendFixtureLoader.loadFixture('song-search');
      expect(fixtures).toHaveProperty('wonderwall');
    });
  });
});
