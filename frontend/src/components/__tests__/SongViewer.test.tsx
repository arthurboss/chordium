import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SongViewer from '../SongViewer';
import { Song } from '@/types/song';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@chordium/types';
import { unifiedChordSheetCache } from '@/cache/implementations/unified-chord-sheet-cache';

// Mock chord sheet cache
vi.mock('@/cache/implementations/unified-chord-sheet-cache', () => ({
  unifiedChordSheetCache: {
    getCachedChordSheet: vi.fn()
  }
}));

// Mock ChordDisplay component
vi.mock('@/components/ChordDisplay', () => ({
  default: vi.fn(({ chordSheet, content, onSave }) => (
    <div data-testid="chord-display">
      <div data-testid="chord-title">{chordSheet?.title}</div>
      <div data-testid="chord-artist">{chordSheet?.artist}</div>
      <div data-testid="chord-content">{content}</div>
      <button onClick={() => onSave?.(content)}>Save</button>
    </div>
  ))
}));

describe('SongViewer', () => {
  const mockGetCachedChordSheet = vi.mocked(unifiedChordSheetCache.getCachedChordSheet);
  const mockChordDisplayRef = { current: document.createElement('div') };
  const mockOnBack = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); // Clean up any existing components
  });

  afterEach(() => {
    cleanup(); // Clean up after each test
  });

  describe('Chord Content Loading', () => {
    it('should load chord content from chord sheet cache using song.path as ID', () => {
      const testSong: Song = {
        title: 'Getsêmani',
        artist: 'Leonardo Gonçalves',
        path: 'leonardo-goncalves-getsemani' // This is now the chord sheet ID, not content
      };

      const mockChordSheet: ChordSheet = {
        title: 'Getsêmani',
        artist: 'Leonardo Gonçalves',
        songChords: '[Intro] C7M  C/G  C4  Dm7(5-)\n        C  C/G  F9  Fm6\n\n[Primeira Parte]\n\nC                C7M\n  No  Getsêmani foi',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 2
      };

      // Mock that the chord sheet cache returns the actual chord content
      mockGetCachedChordSheet.mockReturnValue(mockChordSheet);

      const { container } = render(
        <SongViewer
          song={{ song: testSong, chordSheet: mockChordSheet }}
          chordDisplayRef={mockChordDisplayRef}
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // Verify that chord sheet cache was called with the proper artist and title parameters
      expect(mockGetCachedChordSheet).toHaveBeenCalledWith('Leonardo Gonçalves', 'Getsêmani');

      // Verify that ChordDisplay receives the actual chord content, not the ID
      expect(container.querySelector('[data-testid="chord-content"]')).toHaveTextContent(/\[Intro\] C7M/);
      expect(container.querySelector('[data-testid="chord-title"]')).toHaveTextContent('Getsêmani');
      expect(container.querySelector('[data-testid="chord-artist"]')).toHaveTextContent('Leonardo Gonçalves');
    });

    it('should handle missing chord sheet gracefully', () => {
      const testSong: Song = {
        title: 'Non-existent Song',
        artist: 'Non-existent Artist',
        path: 'non-existent-chord-sheet-id'
      };

      // Mock that the chord sheet cache returns null for missing content
      mockGetCachedChordSheet.mockReturnValue(null);

      const { container } = render(
        <SongViewer
          song={{ song: testSong, chordSheet: { title: testSong.title, artist: testSong.artist, songChords: '', songKey: '', guitarTuning: GUITAR_TUNINGS.STANDARD, guitarCapo: 0 } }}
          chordDisplayRef={mockChordDisplayRef}
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      expect(mockGetCachedChordSheet).toHaveBeenCalledWith('Non-existent Artist', 'Non-existent Song');

      // Should show an error message or empty content
      expect(container.querySelector('[data-testid="chord-content"]')).toHaveTextContent('');
    });

    it('should not display raw chord sheet ID in ChordDisplay', () => {
      const testSong: Song = {
        title: 'Test Song',
        artist: 'Test Artist',
        path: 'test-artist-test-song'
      };

      const mockChordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: 'C G Am F',
        songKey: '',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      // Mock the chord sheet content
      mockGetCachedChordSheet.mockReturnValue(mockChordSheet);

      const { container } = render(
        <SongViewer
          song={{ song: testSong, chordSheet: mockChordSheet }}
          chordDisplayRef={mockChordDisplayRef}
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // The chord display should show actual chord content, not the ID
      expect(container.querySelector('[data-testid="chord-content"]')).toHaveTextContent('C G Am F');
      expect(container.querySelector('[data-testid="chord-content"]')).not.toHaveTextContent('test-artist-test-song');
    });
  });

  describe('User Interactions', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      const testSong: Song = {
        title: 'Test Song',
        artist: 'Test Artist',
        path: 'test'
      };

      mockGetCachedChordSheet.mockReturnValue({ 
        title: 'Test', 
        artist: 'Test', 
        songChords: 'Test content', 
        songKey: '', 
        guitarTuning: GUITAR_TUNINGS.STANDARD, 
        guitarCapo: 0 
      });

      const { getByRole } = render(
        <SongViewer
          song={{ song: testSong, chordSheet: mockGetCachedChordSheet() }}
          chordDisplayRef={mockChordDisplayRef}
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(getByRole('button', { name: /Back/i }));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const testSong: Song = {
        title: 'Test Song',
        artist: 'Test Artist',
        path: 'test-artist-test-song'
      };

      mockGetCachedChordSheet.mockReturnValue({ 
        title: 'Test', 
        artist: 'Test', 
        songChords: 'Test content', 
        songKey: '', 
        guitarTuning: GUITAR_TUNINGS.STANDARD, 
        guitarCapo: 0 
      });

      const { getByRole } = render(
        <SongViewer
          song={{ song: testSong, chordSheet: mockGetCachedChordSheet() }}
          chordDisplayRef={mockChordDisplayRef}
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(getByRole('button', { name: /Delete/i }));
      expect(mockOnDelete).toHaveBeenCalledWith('test-artist-test-song');
    });
  });

  describe('Chord Content Updates', () => {
    it('should update chord sheet when content is saved', async () => {
      const user = userEvent.setup();
      const testSong: Song = {
        title: 'Test Song',
        artist: 'Test Artist',
        path: 'test'
      };

      const mockChordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: 'Original content',
        songKey: '',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      mockGetCachedChordSheet.mockReturnValue(mockChordSheet);

      const { getByText } = render(
        <SongViewer
          song={{ song: testSong, chordSheet: mockChordSheet }}
          chordDisplayRef={mockChordDisplayRef}
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // Click the save button in the mocked ChordDisplay
      await user.click(getByText('Save'));

      // Should call onUpdate with the content
      expect(mockOnUpdate).toHaveBeenCalledWith('Original content');
    });
  });
});
