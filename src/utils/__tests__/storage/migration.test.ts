/**
 * Tests for data migration functionality in unified-song-storage
 * Tests the migration from old storage formats to new ChordSheet format
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  migrateSongsFromOldStorage,
  migrateChordContentFromPath,
} from '@/utils/unified-song-storage';
import { setupLocalStorageMock, createTestChordSheet } from '@/__tests__/shared/test-setup';

describe('Data Migration Functions', () => {
  let localStorageMock: ReturnType<typeof setupLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = setupLocalStorageMock();
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('migrateSongsFromOldStorage', () => {
    it('should migrate songs from chordium-songs key to new storage', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Setup old storage data
      const oldSongs = [
        {
          title: 'Old Song 1',
          artist: 'Old Artist 1',
          content: '[C] Old chord content 1',
        },
        {
          title: 'Old Song 2',
          artist: 'Old Artist 2',
          content: '[G] Old chord content 2',
        },
      ];

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'chordium-songs') {
          return JSON.stringify(oldSongs);
        }
        return null;
      });

      migrateSongsFromOldStorage();

      // Verify migration occurred
      expect(consoleSpy).toHaveBeenCalledWith('Successfully migrated songs from old storage');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('chordium-songs');
      
      consoleSpy.mockRestore();
    });

    it('should not migrate if existing ChordSheets already contain the songs', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Setup old storage with a song
      const oldSongs = [
        {
          title: 'Duplicate Song',
          artist: 'Duplicate Artist',
          content: '[C] Chord content',
        },
      ];

      // Mock that the song already exists in new storage
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'chordium-songs') {
          return JSON.stringify(oldSongs);
        }
        if (key === 'chordium-user-saved-songs') {
          return JSON.stringify({
            items: [{
              key: 'duplicate_artist-duplicate_song',
              data: createTestChordSheet({
                title: 'Duplicate Song',
                artist: 'Duplicate Artist',
              }),
              timestamp: Date.now(),
              accessCount: 1,
            }],
            timestamp: Date.now(),
          });
        }
        return null;
      });

      migrateSongsFromOldStorage();

      // Should still try to migrate but avoid duplicates
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('chordium-songs');
      
      consoleSpy.mockRestore();
    });

    it('should handle migration errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Setup invalid JSON in old storage
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'chordium-songs') {
          return 'invalid json';
        }
        return null;
      });

      migrateSongsFromOldStorage();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to migrate songs from old storage:',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('should do nothing when no old storage exists', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      localStorageMock.getItem.mockReturnValue(null);

      migrateSongsFromOldStorage();

      expect(consoleSpy).not.toHaveBeenCalledWith('Successfully migrated songs from old storage');
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('migrateChordContentFromPath', () => {
    it('should migrate songs with chord content in path field', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Setup old Song format with chord content in path
      const oldSongsWithChordContent = [
        {
          title: 'Song With Chords',
          artist: 'Test Artist',
          path: '[C] Test chord content\n[G] More chords\n[Am] Final chord',
        },
      ];

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'mySongs') {
          return JSON.stringify(oldSongsWithChordContent);
        }
        return null;
      });

      migrateChordContentFromPath();

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔄 Migrating song "Song With Chords" to ChordSheet format'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '✅ Successfully migrated Song objects to ChordSheet format'
      );
      
      consoleSpy.mockRestore();
    });

    it('should migrate songs with content field', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const oldSongsWithContent = [
        {
          title: 'Song With Content Field',
          artist: 'Test Artist',
          path: 'short-path',
          content: '[D] Chord content in content field',
        },
      ];

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'mySongs') {
          return JSON.stringify(oldSongsWithContent);
        }
        return null;
      });

      migrateChordContentFromPath();

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔄 Migrating song "Song With Content Field" to ChordSheet format'
      );
      
      consoleSpy.mockRestore();
    });

    it('should not migrate if already in ChordSheet format', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Setup data that's already in ChordSheet format
      const chordSheetData = [
        createTestChordSheet({
          title: 'Already ChordSheet',
          artist: 'Test Artist',
        }),
      ];

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'mySongs') {
          return JSON.stringify(chordSheetData);
        }
        return null;
      });

      migrateChordContentFromPath();

      // Should not log migration messages
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('🔄 Migrating song')
      );
      
      consoleSpy.mockRestore();
    });

    it('should not migrate if already in cache structure', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Setup data that's already in cache structure
      const cacheStructure = {
        items: [
          {
            key: 'test_artist-test_song',
            data: createTestChordSheet(),
            timestamp: Date.now(),
            accessCount: 1,
          },
        ],
        timestamp: Date.now(),
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'mySongs') {
          return JSON.stringify(cacheStructure);
        }
        return null;
      });

      migrateChordContentFromPath();

      // Should not attempt migration
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('🔄 Migrating song')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle migration errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      migrateChordContentFromPath();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Failed to migrate chord content from path:',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });
});
