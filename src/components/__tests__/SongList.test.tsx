import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SongList from '../SongList';
import { Song } from '@/types/song';

// Mock ResultCard component
vi.mock('@/components/ResultCard', () => ({
  default: vi.fn(({ icon, title, subtitle, onView, onDelete, path, isDeletable }) => (
    <div data-testid={`song-card-${path}`}>
      <div data-testid="song-title">{title}</div>
      <div data-testid="song-artist">{subtitle}</div>
      <div data-testid="song-path">{path}</div>
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

describe('SongList', () => {
  const mockOnSongSelect = vi.fn();
  const mockOnDeleteSong = vi.fn();
  const mockOnUploadClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Song Display - Metadata Only', () => {
    it('should display only song metadata (title, artist) and not chord content', () => {
      const testSongs: Song[] = [
        {
          title: 'Getsêmani',
          artist: 'Leonardo Gonçalves',
          path: 'leonardo-goncalves-getsemani' // This is a chord sheet ID, not content
        },
        {
          title: 'Hotel California',
          artist: 'Eagles',
          path: 'eagles-hotel-california' // This is a chord sheet ID, not content
        }
      ];

      render(
        <SongList
          songs={testSongs}
          onSongSelect={mockOnSongSelect}
          onDeleteSong={mockOnDeleteSong}
          onUploadClick={mockOnUploadClick}
        />
      );

      // Should display song titles and artists
      expect(screen.getByText('Getsêmani')).toBeInTheDocument();
      expect(screen.getByText('Leonardo Gonçalves')).toBeInTheDocument();
      expect(screen.getByText('Hotel California')).toBeInTheDocument();
      expect(screen.getByText('Eagles')).toBeInTheDocument();

      // Should show chord sheet IDs as paths (for navigation purposes)
      expect(screen.getByText('leonardo-goncalves-getsemani')).toBeInTheDocument();
      expect(screen.getByText('eagles-hotel-california')).toBeInTheDocument();

      // Should NOT display chord content like [Intro] C7M, verses, etc.
      expect(screen.queryByText(/\[Intro\]/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\[Verse\]/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\[Chorus\]/)).not.toBeInTheDocument();
    });

    it('should not display raw chord sheet content in song cards', () => {
      // This tests the old behavior to ensure it's been removed
      const testSongs: Song[] = [
        {
          title: 'Legacy Song',
          artist: 'Legacy Artist',
          path: '[Intro] C G Am F\n[Verse]\nC G Am F\nSome lyrics here\n[Chorus]\nF G C\nChorus lyrics'
        }
      ];

      render(
        <SongList
          songs={testSongs}
          onSongSelect={mockOnSongSelect}
          onDeleteSong={mockOnDeleteSong}
          onUploadClick={mockOnUploadClick}
        />
      );

      // Should display metadata
      expect(screen.getByText('Legacy Song')).toBeInTheDocument();
      expect(screen.getByText('Legacy Artist')).toBeInTheDocument();

      // Should NOT break down and display chord notation from path
      const chordNotations = ['[Intro]', '[Verse]', '[Chorus]', 'C G Am F', 'F G C'];
      chordNotations.forEach(notation => {
        // The path might contain these, but they shouldn't be parsed/displayed as chord content
        // The component should only show title and artist
        expect(screen.queryByText(notation)).not.toBeInTheDocument();
      });
    });
  });

  describe('Song Interactions', () => {
    const testSongs: Song[] = [
      {
        title: 'Test Song',
        artist: 'Test Artist',
        path: 'test-artist-test-song'
      }
    ];

    it('should call onSongSelect with full song object when view button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <SongList
          songs={testSongs}
          onSongSelect={mockOnSongSelect}
          onDeleteSong={mockOnDeleteSong}
          onUploadClick={mockOnUploadClick}
        />
      );

      await user.click(screen.getByTestId('view-button'));
      
      expect(mockOnSongSelect).toHaveBeenCalledWith({
        title: 'Test Song',
        artist: 'Test Artist',
        path: 'test-artist-test-song'
      });
    });

    it('should call onDeleteSong with song path when delete button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <SongList
          songs={testSongs}
          onSongSelect={mockOnSongSelect}
          onDeleteSong={mockOnDeleteSong}
          onUploadClick={mockOnUploadClick}
        />
      );

      await user.click(screen.getByTestId('delete-button'));
      
      expect(mockOnDeleteSong).toHaveBeenCalledWith('test-artist-test-song');
    });
  });

  describe('Empty State', () => {
    it('should show upload prompt when no songs are available', () => {
      render(
        <SongList
          songs={[]}
          onSongSelect={mockOnSongSelect}
          onDeleteSong={mockOnDeleteSong}
          onUploadClick={mockOnUploadClick}
        />
      );

      expect(screen.getByText("You haven't saved any songs yet.")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Upload a chord sheet' })).toBeInTheDocument();
    });

    it('should call onUploadClick when upload button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <SongList
          songs={[]}
          onSongSelect={mockOnSongSelect}
          onDeleteSong={mockOnDeleteSong}
          onUploadClick={mockOnUploadClick}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Upload a chord sheet' }));
      expect(mockOnUploadClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Song Order', () => {
    it('should display songs in reverse order (newest first)', () => {
      const testSongs: Song[] = [
        { title: 'Song 1', artist: 'Artist 1', path: 'song-1' },
        { title: 'Song 2', artist: 'Artist 2', path: 'song-2' },
        { title: 'Song 3', artist: 'Artist 3', path: 'song-3' }
      ];

      render(
        <SongList
          songs={testSongs}
          onSongSelect={mockOnSongSelect}
          onDeleteSong={mockOnDeleteSong}
          onUploadClick={mockOnUploadClick}
        />
      );

      // The component reverses the array, so newest (last added) appears first
      const songCards = screen.getAllByTestId(/song-card-/);
      
      // Should show songs in reverse order
      expect(songCards[0]).toHaveAttribute('data-testid', 'song-card-song-3');
      expect(songCards[1]).toHaveAttribute('data-testid', 'song-card-song-2');
      expect(songCards[2]).toHaveAttribute('data-testid', 'song-card-song-1');
    });
  });
});
