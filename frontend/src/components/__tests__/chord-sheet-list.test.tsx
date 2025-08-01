import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { StoredChordSheet } from '@/storage/types';
import ChordSheetList from '../chord-sheet-list';

// Mock ResultCard component
vi.mock('@/components/ResultCard', () => ({
  default: vi.fn(({ icon, title, subtitle, onView, onDelete, path, isDeletable }) => (
    <div data-testid={`chord-sheet-card-${path}`}>
      <div data-testid="chord-sheet-title">{title}</div>
      <div data-testid="chord-sheet-artist">{subtitle}</div>
      <div data-testid="chord-sheet-path">{path}</div>
      <button onClick={onView} data-testid="view-button">
        View Chords
      </button>
      {isDeletable && (
        <button onClick={() => onDelete(path)} data-testid="delete-button">
          Delete
        </button>
      )}
    </div>
  ))
}));

describe('ChordSheetList', () => {
  const mockOnChordSheetSelect = vi.fn();
  const mockOnDeleteChordSheet = vi.fn();
  const mockOnUploadClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Chord Sheet Display - Metadata Only', () => {
    it('should display only chord sheet metadata (title, artist) and not chord content', () => {
      const testChordSheets: StoredChordSheet[] = [
        {
          title: 'Getsêmani',
          artist: 'Leonardo Gonçalves',
          path: 'leonardo-goncalves-getsemani',
          songChords: 'Am F C G...',
          songKey: 'Am',
          guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
          guitarCapo: 0,
          storage: { saved: true, timestamp: Date.now(), lastAccessed: Date.now(), accessCount: 1, version: 1, expiresAt: null }
        },
        {
          title: 'Hotel California',
          artist: 'Eagles',
          path: 'eagles-hotel-california',
          songChords: 'Bm F# A E...',
          songKey: 'Bm',
          guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
          guitarCapo: 0,
          storage: { saved: true, timestamp: Date.now(), lastAccessed: Date.now(), accessCount: 1, version: 1, expiresAt: null }
        }
      ];

      render(
        <ChordSheetList
          chordSheets={testChordSheets}
          onChordSheetSelect={mockOnChordSheetSelect}
          onDeleteChordSheet={mockOnDeleteChordSheet}
          onUploadClick={mockOnUploadClick}
        />
      );

      // Should display chord sheet metadata
      expect(screen.getByText('Getsêmani')).toBeInTheDocument();
      expect(screen.getByText('Leonardo Gonçalves')).toBeInTheDocument();
      expect(screen.getByText('Hotel California')).toBeInTheDocument();
      expect(screen.getByText('Eagles')).toBeInTheDocument();

      // Should NOT display chord content in the list
      expect(screen.queryByText('Am F C G...')).not.toBeInTheDocument();
      expect(screen.queryByText('Bm F# A E...')).not.toBeInTheDocument();
    });

    it('should handle special characters in chord sheet metadata correctly', () => {
      const testChordSheets: StoredChordSheet[] = [
        {
          title: 'Coração',
          artist: 'João & Maria',
          path: 'joao-maria-coracao',
          songChords: 'C G Am F',
          songKey: 'C',
          guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
          guitarCapo: 0,
          storage: { saved: true, timestamp: Date.now(), lastAccessed: Date.now(), accessCount: 1, version: 1, expiresAt: null }
        }
      ];

      render(
        <ChordSheetList
          chordSheets={testChordSheets}
          onChordSheetSelect={mockOnChordSheetSelect}
          onDeleteChordSheet={mockOnDeleteChordSheet}
          onUploadClick={mockOnUploadClick}
        />
      );

      expect(screen.getByText('Coração')).toBeInTheDocument();
      expect(screen.getByText('João & Maria')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state message when no chord sheets are available', () => {
      render(
        <ChordSheetList
          chordSheets={[]}
          onChordSheetSelect={mockOnChordSheetSelect}
          onDeleteChordSheet={mockOnDeleteChordSheet}
          onUploadClick={mockOnUploadClick}
        />
      );

      expect(screen.getByText("You haven't saved any chord sheets yet.")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload a chord sheet/i })).toBeInTheDocument();
    });

    it('should call onUploadClick when upload button is clicked in empty state', async () => {
      const user = userEvent.setup();

      render(
        <ChordSheetList
          chordSheets={[]}
          onChordSheetSelect={mockOnChordSheetSelect}
          onDeleteChordSheet={mockOnDeleteChordSheet}
          onUploadClick={mockOnUploadClick}
        />
      );

      const uploadButton = screen.getByRole('button', { name: /upload a chord sheet/i });
      await user.click(uploadButton);

      expect(mockOnUploadClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Chord Sheet Interactions', () => {
    const testChordSheets: StoredChordSheet[] = [
      {
        title: 'Test Chord Sheet',
        artist: 'Test Artist',
        path: 'test-artist-test-chord-sheet',
        songChords: 'C G Am F',
        songKey: 'C',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        storage: { saved: true, timestamp: Date.now(), lastAccessed: Date.now(), accessCount: 1, version: 1, expiresAt: null }
      }
    ];

    it('should call onChordSheetSelect with the correct chord sheet when view button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChordSheetList
          chordSheets={testChordSheets}
          onChordSheetSelect={mockOnChordSheetSelect}
          onDeleteChordSheet={mockOnDeleteChordSheet}
          onUploadClick={mockOnUploadClick}
        />
      );

      const viewButton = screen.getByTestId('view-button');
      await user.click(viewButton);

      expect(mockOnChordSheetSelect).toHaveBeenCalledTimes(1);
      expect(mockOnChordSheetSelect).toHaveBeenCalledWith(testChordSheets[0]);
    });

    it('should call onDeleteChordSheet with the correct path when delete button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChordSheetList
          chordSheets={testChordSheets}
          onChordSheetSelect={mockOnChordSheetSelect}
          onDeleteChordSheet={mockOnDeleteChordSheet}
          onUploadClick={mockOnUploadClick}
        />
      );

      const deleteButton = screen.getByTestId('delete-button');
      await user.click(deleteButton);

      expect(mockOnDeleteChordSheet).toHaveBeenCalledTimes(1);
      expect(mockOnDeleteChordSheet).toHaveBeenCalledWith('test-artist-test-chord-sheet');
    });
  });

  describe('Chord Sheet Display Order', () => {
    it('should display chord sheets in reverse order (newest first)', () => {
      const testChordSheets: StoredChordSheet[] = [
        {
          title: 'First Added',
          artist: 'Artist A',
          path: 'artist-a-first-added',
          songChords: 'C G Am F',
          songKey: 'C',
          guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
          guitarCapo: 0,
          storage: { saved: true, timestamp: new Date('2023-01-01').getTime(), lastAccessed: Date.now(), accessCount: 1, version: 1, expiresAt: null }
        },
        {
          title: 'Second Added',
          artist: 'Artist B',
          path: 'artist-b-second-added',
          songChords: 'D A Bm G',
          songKey: 'D',
          guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
          guitarCapo: 0,
          storage: { saved: true, timestamp: new Date('2023-01-02').getTime(), lastAccessed: Date.now(), accessCount: 1, version: 1, expiresAt: null }
        }
      ];

      render(
        <ChordSheetList
          chordSheets={testChordSheets}
          onChordSheetSelect={mockOnChordSheetSelect}
          onDeleteChordSheet={mockOnDeleteChordSheet}
          onUploadClick={mockOnUploadClick}
        />
      );

      const chordSheetCards = screen.getAllByTestId(/chord-sheet-card-/);
      
      // Should be in reverse order (newest first)
      expect(chordSheetCards[0]).toHaveAttribute('data-testid', 'chord-sheet-card-artist-b-second-added');
      expect(chordSheetCards[1]).toHaveAttribute('data-testid', 'chord-sheet-card-artist-a-first-added');
    });
  });
});
