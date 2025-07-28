import { jest } from '@jest/globals';

/**
 * Mock CifraClub Service
 * Provides mocked implementations for the CifraClub service methods
 */

interface MockCifraClubService {
  baseUrl: string;
  search: jest.MockedFunction<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  getArtistSongs: jest.MockedFunction<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  getChordSheet: jest.MockedFunction<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  
  // Helper methods for tests
  mockSuccessfulSearch(results: any): MockCifraClubService; // eslint-disable-line @typescript-eslint/no-explicit-any
  mockSearchError(error: any): MockCifraClubService; // eslint-disable-line @typescript-eslint/no-explicit-any
  mockSuccessfulArtistSongs(songs: any): MockCifraClubService; // eslint-disable-line @typescript-eslint/no-explicit-any
  mockArtistSongsError(error: any): MockCifraClubService; // eslint-disable-line @typescript-eslint/no-explicit-any
  mockSuccessfulChordSheet(content: any): MockCifraClubService; // eslint-disable-line @typescript-eslint/no-explicit-any
  mockChordSheetError(error: any): MockCifraClubService; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Mock CifraClub service
const mockCifraClubService: MockCifraClubService = {
  baseUrl: 'https://www.cifraclub.com.br',
  search: jest.fn(),
  getArtistSongs: jest.fn(),
  getChordSheet: jest.fn(),
  
  // Helper methods for tests
  mockSuccessfulSearch: function(results: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.search.mockResolvedValue(results);
    return this;
  },
  
  mockSearchError: function(error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.search.mockRejectedValue(error);
    return this;
  },
  
  mockSuccessfulArtistSongs: function(songs: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.getArtistSongs.mockResolvedValue(songs);
    return this;
  },
  
  mockArtistSongsError: function(error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.getArtistSongs.mockRejectedValue(error);
    return this;
  },
  
  mockSuccessfulChordSheet: function(content: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.getChordSheet.mockResolvedValue(content);
    return this;
  },
  
  mockChordSheetError: function(error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.getChordSheet.mockRejectedValue(error);
    return this;
  }
};

export default mockCifraClubService;
