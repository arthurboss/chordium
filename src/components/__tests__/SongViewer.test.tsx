import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SongViewer from '../SongViewer';
import { Song } from '@/types/song';
import { ChordSheet } from '@/types/chordSheet';
import { getChordSheet } from '@/utils/chord-sheet-storage';

// Mock chord sheet storage
vi.mock('@/utils/chord-sheet-storage', () => ({
  getChordSheet: vi.fn()
}));

// Mock ChordDisplay component
vi.mock('@/components/ChordDisplay', () => ({
  default: vi.fn(({ title, artist, content, onSave }) => (
    <div data-testid="chord-display">
      <div data-testid="chord-title">{title}</div>
      <div data-testid="chord-artist">{artist}</div>
      <div data-testid="chord-content">{content}</div>
      <button onClick={() => onSave?.(content)}>Save</button>
    </div>
  ))
}));

describe('SongViewer', () => {
  const mockGetChordSheet = vi.mocked(getChordSheet);
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
    it('should load chord content from chord sheet storage using song.path as ID', () => {
      const testSong: Song = {
        title: 'Getsêmani',
        artist: 'Leonardo Gonçalves',
        path: 'leonardo-goncalves-getsemani' // This is now the chord sheet ID, not content
      };

      const mockChordSheet: ChordSheet = {
        title: 'Getsêmani',
        artist: 'Leonardo Gonçalves',
        chords: '[Intro] C7M  C/G  C4  Dm7(5-)\n        C  C/G  F9  Fm6\n\n[Primeira Parte]\n\nC                C7M\n  No  Getsêmani foi',
        key: 'C',
        tuning: 'Standard',
        capo: '2'
      };

      // Mock that the chord sheet storage returns the actual chord content
      mockGetChordSheet.mockReturnValue(mockChordSheet);

      const { container } = render(
        <SongViewer
          song={testSong}
          chordDisplayRef={mockChordDisplayRef}
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // Verify that chord sheet storage was called with the song.path as ID
      expect(mockGetChordSheet).toHaveBeenCalledWith('leonardo-goncalves-getsemani');

      // Verify that ChordDisplay receives the actual chord content, not the ID
      expect(container.querySelector('[data-testid="chord-content"]')).toHaveTextContent(/\[Intro\] C7M/);
      expect(container.querySelector('[data-testid="chord-title"]')).toHaveTextContent('Getsêmani');
      expect(container.querySelector('[data-testid="chord-artist"]')).toHaveTextContent('Leonardo Gonçalves');
    });

    it('should handle missing chord sheet gracefully', () => {
      const testSong: Song = {
        title: 'Missing Song',
        artist: 'Unknown Artist',
        path: 'non-existent-chord-sheet-id'
      };

      // Mock that the chord sheet is not found
      mockGetChordSheet.mockReturnValue(null);

      const { container } = render(
        <SongViewer
          song={testSong}
          chordDisplayRef={mockChordDisplayRef}
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      expect(mockGetChordSheet).toHaveBeenCalledWith('non-existent-chord-sheet-id');

      // Should show an error message or empty content
      expect(container.querySelector('[data-testid="chord-content"]')).toHaveTextContent('');
    });

    it('should not display raw chord sheet ID in ChordDisplay', () => {
      const testSong: Song = {
        title: 'Test Song',
        artist: 'Test Artist',
        path: 'test-artist-test-song' // This should NOT appear as content
      };

      const mockChordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        chords: 'C G Am F\nThis is the actual chord content',
        key: 'C',
        tuning: 'Standard',
        capo: ''
      };

      mockGetChordSheet.mockReturnValue(mockChordSheet);

      const { container } = render(
        <SongViewer
          song={testSong}
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

  describe('Button Interactions', () => {
    const testSong: Song = {
      title: 'Test Song',
      artist: 'Test Artist',
      path: 'test-id'
    };

    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      mockGetChordSheet.mockReturnValue({ title: 'Test', artist: 'Test', chords: 'Test content' });

      const { container } = render(
        <SongViewer
          song={testSong}
          chordDisplayRef={mockChordDisplayRef}
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
          backButtonLabel="Back to My Songs"
        />
      );

      const backButton = container.querySelector('button[aria-label="Back to My Songs"]');
      if (backButton) {
        await user.click(backButton);
      }
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete with song.path when delete button is clicked', async () => {
      const user = userEvent.setup();
      mockGetChordSheet.mockReturnValue({ title: 'Test', artist: 'Test', chords: 'Test content' });

      const { container } = render(
        <SongViewer
          song={testSong}
          chordDisplayRef={mockChordDisplayRef}
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
          deleteButtonLabel="Delete Song"
        />
      );

      const deleteButton = container.querySelector('button[aria-label="Delete Song"]');
      if (deleteButton) {
        await user.click(deleteButton);
      }
      expect(mockOnDelete).toHaveBeenCalledWith('test-id');
    });
  });

  describe('Chord Content Updates', () => {
    it('should update chord sheet storage when content is saved', async () => {
      const testSong: Song = {
        title: 'Test Song',
        artist: 'Test Artist',
        path: 'test-artist-test-song'
      };

      const mockChordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        chords: 'Original content',
        key: 'C',
        tuning: 'Standard',
        capo: ''
      };

      mockGetChordSheet.mockReturnValue(mockChordSheet);

      const { container } = render(
        <SongViewer
          song={testSong}
          chordDisplayRef={mockChordDisplayRef}
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // Simulate content change and save
      const user = userEvent.setup();
      const saveButton = container.querySelector('[data-testid="chord-display"] button');
      if (saveButton) {
        await user.click(saveButton);
      }

      // Should call onUpdate with the content
      expect(mockOnUpdate).toHaveBeenCalledWith('Original content');
    });
  });
});
