import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SearchTab from '../tabs/SearchTab';
import { SearchStateProvider } from '@/context/SearchStateContext';

// Mock the search cache
vi.mock('@/cache/implementations/search-cache', () => ({
  setLastSearchQuery: vi.fn(),
}));

// Mock the URL slug utils
vi.mock('@/utils/url-slug-utils', () => ({
  toSlug: vi.fn((str) => str.toLowerCase().replace(/\s+/g, '-')),
}));

// Mock the test utils
vi.mock('@/utils/test-utils/cy-attr', () => ({
  cyAttr: vi.fn(() => ({})),
}));

// Mock the SearchResults component
vi.mock('../SearchResults', () => ({
  default: vi.fn(({ onArtistSelect, activeArtist }) => (
    <div data-testid="search-results">
      <div data-testid="active-artist">{activeArtist?.displayName || 'none'}</div>
      <button 
        data-testid="select-artist-button"
        onClick={() => onArtistSelect({ 
          path: '/test-artist', 
          displayName: 'Test Artist', 
          songCount: 5 
        })}
      >
        Select Artist
      </button>
    </div>
  )),
}));

// Mock the SearchBar component
vi.mock('../SearchBar', () => ({
  default: vi.fn(({ showBackButton, onBackClick, artistValue, songValue, loading = false, artistLoading = false }) => (
    <div data-testid="search-bar">
      <div data-testid="artist-input">{artistValue}</div>
      <div data-testid="song-input">{songValue}</div>
      <div data-testid="show-back-button">{showBackButton ? 'true' : 'false'}</div>
      <button 
        data-testid="back-button"
        onClick={onBackClick}
        disabled={!!(loading || artistLoading || !showBackButton || !onBackClick)}
      >
        Back
      </button>
      <button data-testid="search-submit">Search</button>
    </div>
  )),
}));

// Mock the FormContainer component
vi.mock('../ui/FormContainer', () => ({
  default: vi.fn(({ children }) => <div data-testid="form-container">{children}</div>),
}));

// Mock the SongViewer component
vi.mock('../SongViewer', () => ({
  default: vi.fn(({ song, onBack }) => (
    <div data-testid="song-viewer">
      <div data-testid="song-title">{song.title}</div>
      <button data-testid="song-viewer-back" onClick={onBack}>
        Back to Search
      </button>
    </div>
  )),
}));

const renderSearchTab = () => {
  return render(
    <BrowserRouter>
      <SearchStateProvider>
        <SearchTab 
          setMySongs={vi.fn()}
          setActiveTab={vi.fn()}
          setSelectedSong={vi.fn()}
          myChordSheets={[]}
        />
      </SearchStateProvider>
    </BrowserRouter>
  );
};

describe('SearchTab - Back Button Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Artist Selection Flow', () => {
    it('should show back button when an artist is selected and user is viewing artist songs', async () => {
      // Arrange: Render SearchTab
      renderSearchTab();
      
      // Act: Simulate artist selection
      const selectArtistButton = screen.getByTestId('select-artist-button');
      fireEvent.click(selectArtistButton);
      
      // Assert: Back button should be shown and enabled
      await waitFor(() => {
        const backButton = screen.getByTestId('back-button');
        const showBackButton = screen.getByTestId('show-back-button');
        
        expect(showBackButton).toHaveTextContent('true');
        expect(backButton).not.toBeDisabled();
      });
    });

    it('should hide back button when no artist is selected', () => {
      // Arrange & Act: Render SearchTab (no artist selected initially)
      renderSearchTab();
      
      // Assert: Back button should be hidden
      const showBackButton = screen.getByTestId('show-back-button');
      expect(showBackButton).toHaveTextContent('false');
    });

    it('should clear active artist when back button is clicked', async () => {
      // Arrange: Render and select an artist
      renderSearchTab();
      
      // Select an artist
      const selectArtistButton = screen.getByTestId('select-artist-button');
      fireEvent.click(selectArtistButton);
      
      // Wait for back button to appear
      await waitFor(() => {
        expect(screen.getByTestId('show-back-button')).toHaveTextContent('true');
      });
      
      // Act: Click back button
      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);
      
      // Assert: Active artist should be cleared (back to artist list)
      await waitFor(() => {
        const activeArtist = screen.getByTestId('active-artist');
        expect(activeArtist).toHaveTextContent('none');
      });
      
      // Back button should be hidden again
      const showBackButton = screen.getByTestId('show-back-button');
      expect(showBackButton).toHaveTextContent('false');
    });

    it('should not show back button for song-only searches', async () => {
      // Arrange: Render SearchTab
      renderSearchTab();
      
      // Act: Simulate song search (no artist selection)
      const searchSubmit = screen.getByTestId('search-submit');
      fireEvent.click(searchSubmit);
      
      // Assert: Back button should remain hidden for song searches
      const showBackButton = screen.getByTestId('show-back-button');
      expect(showBackButton).toHaveTextContent('false');
    });

    it('should maintain search input values when going back to artist list', async () => {
      // Arrange: Render and set up search
      renderSearchTab();
      
      // Simulate user typing in search inputs
      const artistInput = screen.getByTestId('artist-input');
      const songInput = screen.getByTestId('song-input');
      
      // Act: Select artist then go back
      const selectArtistButton = screen.getByTestId('select-artist-button');
      fireEvent.click(selectArtistButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('show-back-button')).toHaveTextContent('true');
      });
      
      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);
      
      // Assert: Search inputs should maintain their values
      await waitFor(() => {
        expect(artistInput).toBeInTheDocument();
        expect(songInput).toBeInTheDocument();
      });
    });
  });

  describe('Back Button State Management', () => {
    it('should enable back button only when artist is selected', async () => {
      // Arrange: Render SearchTab
      renderSearchTab();
      
      // Initially back button should be disabled
      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeDisabled();
      
      // Act: Select an artist
      const selectArtistButton = screen.getByTestId('select-artist-button');
      fireEvent.click(selectArtistButton);
      
      // Assert: Back button should be enabled
      await waitFor(() => {
        expect(backButton).not.toBeDisabled();
      });
    });

    it('should disable back button when loading', async () => {
      // Arrange: Render SearchTab and select artist
      renderSearchTab();
      
      const selectArtistButton = screen.getByTestId('select-artist-button');
      fireEvent.click(selectArtistButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('back-button')).not.toBeDisabled();
      });
      
      // Act: Simulate loading state (this would be triggered by search)
      const searchSubmit = screen.getByTestId('search-submit');
      fireEvent.click(searchSubmit);
      
      // Assert: Back button should be disabled during loading
      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeDisabled();
    });
  });
}); 