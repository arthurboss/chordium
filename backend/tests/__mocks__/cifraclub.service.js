import { jest } from '@jest/globals';

// Mock CifraClub service
export default {
  baseUrl: 'https://www.cifraclub.com.br',
  search: jest.fn(),
  getArtistSongs: jest.fn(),
  getChordSheet: jest.fn(),
  
  // Helper methods for tests
  mockSuccessfulSearch: function(results) {
    this.search.mockResolvedValue(results);
    return this;
  },
  
  mockSearchError: function(error) {
    this.search.mockRejectedValue(error);
    return this;
  },
  
  mockSuccessfulArtistSongs: function(songs) {
    this.getArtistSongs.mockResolvedValue(songs);
    return this;
  },
  
  mockArtistSongsError: function(error) {
    this.getArtistSongs.mockRejectedValue(error);
    return this;
  },
  
  mockSuccessfulChordSheet: function(content) {
    this.getChordSheet.mockResolvedValue(content);
    return this;
  },
  
  mockChordSheetError: function(error) {
    this.getChordSheet.mockRejectedValue(error);
    return this;
  }
};
