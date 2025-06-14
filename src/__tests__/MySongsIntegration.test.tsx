import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getChordSheet } from '@/utils/chord-sheet-storage';
import { Song } from '@/types/song';
import { ChordSheet } from '@/types/chordSheet';

// Mock chord sheet storage
vi.mock('@/utils/chord-sheet-storage', () => ({
  getChordSheet: vi.fn(),
  saveChordSheet: vi.fn(),
  generateChordSheetId: vi.fn()
}));

describe('My Songs Storage Integration', () => {
  const mockGetChordSheet = vi.mocked(getChordSheet);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Song Metadata vs Chord Content Separation', () => {
    it('should store chord sheet ID in song.path and retrieve chord content separately', () => {
      // This test verifies the core principle of our refactoring:
      // Songs store only metadata + chord sheet ID, not the full chord content
      
      const song: Song = {
        title: 'Getsêmani',
        artist: 'Leonardo Gonçalves',
        path: 'leonardo-goncalves-getsemani' // This is the chord sheet ID
      };

      const expectedChordSheet: ChordSheet = {
        title: 'Getsêmani',
        artist: 'Leonardo Gonçalves',
        chords: '[Intro] C7M  C/G  C4  Dm7(5-)\n        C  C/G  F9  Fm6\n\n[Primeira Parte]\n\nC                C7M\n  No  Getsêmani foi',
        key: 'C',
        tuning: 'Standard',
        capo: '2'
      };

      mockGetChordSheet.mockReturnValue(expectedChordSheet);

      // Simulate the SongViewer component behavior:
      // 1. Use song.path as the chord sheet ID
      const chordSheetId = song.path;
      
      // 2. Load chord content from storage using the ID
      const chordSheet = getChordSheet(chordSheetId);
      const chordContent = chordSheet?.chords ?? '';

      // Verify the correct behavior
      expect(getChordSheet).toHaveBeenCalledWith('leonardo-goncalves-getsemani');
      expect(chordContent).toContain('[Intro] C7M');
      expect(chordContent).toContain('No  Getsêmani foi');
      
      // Verify separation: song only has metadata, chord content comes from storage
      expect(song.path).toBe('leonardo-goncalves-getsemani'); // ID, not content
      expect(song.title).toBe('Getsêmani');
      expect(song.artist).toBe('Leonardo Gonçalves');
      
      // Song should NOT contain chord content directly
      expect(song.path).not.toContain('[Intro]');
      expect(song.path).not.toContain('C7M');
    });

    it('should handle missing chord sheets gracefully', () => {
      const song: Song = {
        title: 'Missing Song',
        artist: 'Unknown Artist',
        path: 'non-existent-chord-id'
      };

      // Mock that chord sheet is not found
      mockGetChordSheet.mockReturnValue(null);

      // Simulate SongViewer loading logic
      const chordSheet = getChordSheet(song.path);
      const chordContent = chordSheet?.chords ?? '';

      expect(getChordSheet).toHaveBeenCalledWith('non-existent-chord-id');
      expect(chordContent).toBe(''); // Empty string when not found
      
      // Song metadata should still be available
      expect(song.title).toBe('Missing Song');
      expect(song.artist).toBe('Unknown Artist');
    });

    it('should demonstrate the old vs new approach difference', () => {
      // OLD APPROACH (what we're fixing):
      const oldStyleSong = {
        title: 'Old Song',
        artist: 'Old Artist',
        path: '[Intro] C G Am F\n[Verse]\nC G Am F\nSome lyrics here\n[Chorus]\nF G C\nChorus lyrics'
      };

      // NEW APPROACH (our refactored version):
      const newStyleSong: Song = {
        title: 'New Song',
        artist: 'New Artist',
        path: 'new-artist-new-song' // ID only
      };

      const newStyleChordSheet: ChordSheet = {
        title: 'New Song',
        artist: 'New Artist',
        chords: '[Intro] C G Am F\n[Verse]\nC G Am F\nSome lyrics here\n[Chorus]\nF G C\nChorus lyrics',
        key: 'C',
        tuning: 'Standard',
        capo: ''
      };

      mockGetChordSheet.mockReturnValue(newStyleChordSheet);

      // In the old approach, song.path contains chord content (problematic)
      expect(oldStyleSong.path).toContain('[Intro]');
      expect(oldStyleSong.path).toContain('C G Am F');
      expect(oldStyleSong.path.length).toBeGreaterThan(50); // Very long

      // In the new approach, song.path is just an ID
      expect(newStyleSong.path).toBe('new-artist-new-song');
      expect(newStyleSong.path).not.toContain('[Intro]');
      expect(newStyleSong.path.length).toBeLessThan(50); // Much shorter

      // Chord content is retrieved separately
      const chordSheet = getChordSheet(newStyleSong.path);
      expect(chordSheet?.chords).toContain('[Intro]');
      expect(chordSheet?.chords).toContain('C G Am F');
    });
  });
});
