import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findExistingSong, shouldOpenExistingSong, createSongIdentifier } from '../song-deduplication';
import { Song } from '@/types/song';

describe('Song Deduplication Utils', () => {
  const mockSongs: Song[] = [
    {
      path: 'oasis/wonderwall',
      title: 'Wonderwall',
      artist: 'Oasis'
    },
    {
      path: 'oasis/dont-look-back-in-anger',
      title: "Don't Look Back in Anger",
      artist: 'Oasis'
    },
    {
      path: 'metallica/nothing-else-matters',
      title: 'Nothing Else Matters',
      artist: 'Metallica'
    }
  ];

  describe('createSongIdentifier', () => {
    it('should create identifier from artist and title', () => {
      const identifier = createSongIdentifier('Oasis', 'Wonderwall');
      expect(identifier).toBe('oasis|wonderwall');
    });

    it('should normalize case and trim whitespace', () => {
      const identifier = createSongIdentifier('  OASIS  ', '  WonderWall  ');
      expect(identifier).toBe('oasis|wonderwall');
    });

    it('should handle special characters', () => {
      const identifier = createSongIdentifier('Oasis', "Don't Look Back in Anger");
      expect(identifier).toBe("oasis|don't look back in anger");
    });

    it('should handle empty values', () => {
      const identifier = createSongIdentifier('', '');
      expect(identifier).toBe('|');
    });
  });

  describe('findExistingSong', () => {
    it('should find song by exact artist and title match', () => {
      const found = findExistingSong(mockSongs, 'Oasis', 'Wonderwall');
      expect(found).toEqual(mockSongs[0]);
    });

    it('should find song by case-insensitive match', () => {
      const found = findExistingSong(mockSongs, 'OASIS', 'wonderwall');
      expect(found).toEqual(mockSongs[0]);
    });

    it('should find song by path match', () => {
      const found = findExistingSong(mockSongs, 'oasis/wonderwall');
      expect(found).toEqual(mockSongs[0]);
    });

    it('should return undefined if song not found', () => {
      const found = findExistingSong(mockSongs, 'Radiohead', 'Creep');
      expect(found).toBeUndefined();
    });

    it('should handle incomplete song data gracefully', () => {
      const incompleteSongs = [
        { path: 'incomplete/song', title: 'Incomplete', artist: '' },
        { path: '', title: 'No Path', artist: 'Artist' }
      ];
      
      const found = findExistingSong(incompleteSongs, 'Artist', 'No Path');
      expect(found).toEqual(incompleteSongs[1]);
    });

    it('should prioritize exact matches over partial matches', () => {
      const songsWithSimilarTitles = [
        { path: 'artist/song', title: 'Song', artist: 'Artist' },
        { path: 'artist/song-remix', title: 'Song Remix', artist: 'Artist' }
      ];
      
      const found = findExistingSong(songsWithSimilarTitles, 'Artist', 'Song');
      expect(found).toEqual(songsWithSimilarTitles[0]);
    });
  });

  describe('shouldOpenExistingSong', () => {
    let mockNavigate: ReturnType<typeof vi.fn>;
    let mockSetSelectedSong: ReturnType<typeof vi.fn>;
    let mockSetActiveTab: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockNavigate = vi.fn();
      mockSetSelectedSong = vi.fn();
      mockSetActiveTab = vi.fn();
    });

    it('should navigate to existing song and return true', () => {
      const callbacks = {
        navigate: mockNavigate,
        setSelectedSong: mockSetSelectedSong,
        setActiveTab: mockSetActiveTab
      };

      const result = shouldOpenExistingSong(
        mockSongs,
        'Oasis',
        'Wonderwall',
        callbacks
      );

      expect(result).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith('/my-songs/oasis/wonderwall');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(mockSongs[0]);
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-songs');
    });

    it('should return false if song not found', () => {
      const callbacks = {
        navigate: mockNavigate,
        setSelectedSong: mockSetSelectedSong,
        setActiveTab: mockSetActiveTab
      };

      const result = shouldOpenExistingSong(
        mockSongs,
        'Radiohead',
        'Creep',
        callbacks
      );

      expect(result).toBe(false);
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockSetSelectedSong).not.toHaveBeenCalled();
      expect(mockSetActiveTab).not.toHaveBeenCalled();
    });

    it('should handle song with path parameter', () => {
      const callbacks = {
        navigate: mockNavigate,
        setSelectedSong: mockSetSelectedSong,
        setActiveTab: mockSetActiveTab
      };

      const result = shouldOpenExistingSong(
        mockSongs,
        'metallica/nothing-else-matters',
        undefined,
        callbacks
      );

      expect(result).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith('/my-songs/metallica/nothing-else-matters');
      expect(mockSetSelectedSong).toHaveBeenCalledWith(mockSongs[2]);
      expect(mockSetActiveTab).toHaveBeenCalledWith('my-songs');
    });

    it('should handle missing callbacks gracefully', () => {
      const result = shouldOpenExistingSong(
        mockSongs,
        'Oasis',
        'Wonderwall',
        {}
      );

      expect(result).toBe(true); // Song found but no navigation
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle sample songs vs searched songs correctly', () => {
      const sampleSongs = [
        { path: 'sample/wonderwall', title: 'Wonderwall', artist: 'Oasis' }
      ];

      const searchedSongs = [
        { path: 'oasis/wonderwall', title: 'Wonderwall', artist: 'Oasis' }
      ];

      // Should find the sample song when searching for Wonderwall
      const foundSample = findExistingSong(sampleSongs, 'Oasis', 'Wonderwall');
      expect(foundSample).toEqual(sampleSongs[0]);

      // Should find the searched song when added to my songs
      const foundSearched = findExistingSong(searchedSongs, 'Oasis', 'Wonderwall');
      expect(foundSearched).toEqual(searchedSongs[0]);
    });

    it('should handle songs with missing artist data', () => {
      const incompleteSearchedSongs = [
        { path: 'unknown/wonderwall', title: 'Wonderwall', artist: '' }
      ];

      // Should still find by title if artist is missing
      const found = findExistingSong(incompleteSearchedSongs, '', 'Wonderwall');
      expect(found).toEqual(incompleteSearchedSongs[0]);
    });
  });
});
