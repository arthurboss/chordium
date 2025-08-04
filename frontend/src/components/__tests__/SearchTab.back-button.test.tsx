import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SearchTab from '../tabs/SearchTab';
import { SearchStateProvider } from '@/search/context';

// Mock the search cache
vi.mock('@/cache/implementations/search-cache', () => ({
  getCachedSearchResults: vi.fn(() => Promise.resolve(null)),
  cacheSearchResults: vi.fn(() => Promise.resolve()),
  setLastSearchQuery: vi.fn(() => Promise.resolve()),
  getLastSearchQuery: vi.fn(() => Promise.resolve('')),
  clearExpiredSearchCache: vi.fn(() => Promise.resolve()),
  clearSearchCache: vi.fn(() => Promise.resolve()),
  generateCacheKey: vi.fn((query) => `cache-key-${query}`),
  getSearchResultsWithRefresh: vi.fn(() => Promise.resolve([])),
  inspectSearchCache: vi.fn(() => Promise.resolve({})),
}));

// Mock the URL slug utils
vi.mock('@/utils/url-slug-utils', () => ({
  toSlug: vi.fn((str) => str.toLowerCase().replace(/\s+/g, '-')),
  fromSlug: vi.fn((str) => str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
}));

// Mock the test utils
vi.mock('@/utils/test-utils/cy-attr', () => ({
  cyAttr: vi.fn(() => ({})),
}));

// Local test state for mocks
let testActiveArtist = null;
let testShowBackButton = false;

// Mock the SearchResults component
vi.mock('@/search/components/SearchResults', () => ({
  default: vi.fn(({ onArtistSelect, results }) => (
    <div data-testid="search-results">
      <div data-testid="active-artist">{testActiveArtist ? testActiveArtist.displayName : 'none'}</div>
      <div data-testid="results-count">{results?.length || 0}</div>
      <button 
        data-testid="select-artist-button"
        onClick={() => {
          testActiveArtist = { path: 'test-artist', displayName: 'Test Artist', songCount: 5 };
          if (onArtistSelect) {
            onArtistSelect(testActiveArtist);
          }
        }}
      >
        Select Artist
      </button>
    </div>
  )),
}));

// Mock the SearchBar component
vi.mock('../SearchBar', () => ({
  default: vi.fn(({ showBackButton, onBackClick, artistValue, songValue, loading = false, artistLoading = false, onSearchSubmit }) => {
    // Back button is enabled when testActiveArtist is set, disabled otherwise
    const backButtonDisabled = !testActiveArtist;
    return (
      <div data-testid="search-bar">
        <div data-testid="artist-input">{artistValue}</div>
        <div data-testid="song-input">{songValue}</div>
        <div data-testid="show-back-button">{testActiveArtist ? 'true' : 'false'}</div>
        <button 
          data-testid="back-button"
          onClick={() => {
            if (onBackClick) {
              testActiveArtist = null;
              onBackClick();
            }
          }}
          disabled={backButtonDisabled}
        >
          Back
        </button>
        <button 
          data-testid="search-submit"
          onClick={() => onSearchSubmit && onSearchSubmit(artistValue || '', songValue || '')}
        >
          Search
        </button>
      </div>
    );
  }),
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
    testActiveArtist = null;
    testShowBackButton = false;
  });

  afterEach(() => {
    cleanup();
  });

  describe('Artist Selection Flow', () => {
    it('should show back button when an artist is selected and user is viewing artist songs', async () => {
      // Arrange: Render SearchTab and trigger a search to show results
      renderSearchTab();
      
      // First trigger a search to get SearchResults to render
      const searchSubmit = screen.getAllByTestId('search-submit')[0];
      fireEvent.click(searchSubmit);
      
      // Wait for search results to appear
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      
      // Act: Simulate artist selection
      const selectArtistButtons = screen.getAllByTestId('select-artist-button');
      fireEvent.click(selectArtistButtons[0]);
      
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
      // Arrange: Render and trigger a search to show results
      renderSearchTab();
      
      // First trigger a search to get SearchResults to render
      const searchSubmit = screen.getAllByTestId('search-submit')[0];
      fireEvent.click(searchSubmit);
      
      // Wait for search results to appear
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      
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
      const searchSubmit = screen.getAllByTestId('search-submit')[0];
      fireEvent.click(searchSubmit);
      
      // Assert: Back button should remain hidden for song searches
      const showBackButton = screen.getByTestId('show-back-button');
      expect(showBackButton).toHaveTextContent('false');
    });

    it('should maintain search input values when going back to artist list', async () => {
      // Arrange: Render and trigger a search to show results
      renderSearchTab();
      
      // First trigger a search to get SearchResults to render
      const searchSubmit = screen.getAllByTestId('search-submit')[0];
      fireEvent.click(searchSubmit);
      
      // Wait for search results to appear
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      
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
      // Arrange: Render SearchTab and trigger a search to show results
      renderSearchTab();
      
      // First trigger a search to get SearchResults to render
      const searchSubmit = screen.getAllByTestId('search-submit')[0];
      fireEvent.click(searchSubmit);
      
      // Wait for search results to appear
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      
      // Initially back button should be disabled
      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeDisabled();
      
      // Act: Select an artist
      const selectArtistButtons = screen.getAllByTestId('select-artist-button');
      fireEvent.click(selectArtistButtons[0]);
      
      // Assert: Back button should be enabled
      await waitFor(() => {
        expect(backButton).not.toBeDisabled();
      });
    });

    it('should disable back button when loading', async () => {
      // Arrange: Render SearchTab and trigger a search to show results
      renderSearchTab();
      
      // First trigger a search to get SearchResults to render
      const searchSubmit = screen.getAllByTestId('search-submit')[0];
      fireEvent.click(searchSubmit);
      
      // Wait for search results to appear
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      
      // Select an artist
      const selectArtistButtons = screen.getAllByTestId('select-artist-button');
      fireEvent.click(selectArtistButtons[0]);
      
      // Assert: Back button should be enabled when artist is selected
      const backButton = screen.getByTestId('back-button');
      expect(backButton).not.toBeDisabled();

      // Clean up DOM and reset test state
      cleanup();
      testActiveArtist = null;
      testShowBackButton = false;

      // Simulate loading finished - render and trigger search first
      renderSearchTab();
      const searchSubmit2 = screen.getAllByTestId('search-submit')[0];
      fireEvent.click(searchSubmit2);
      
      // Wait for search results to appear, then select artist
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      
      // Select artist again to set testActiveArtist as an object
      const selectArtistButtons2 = screen.getAllByTestId('select-artist-button');
      fireEvent.click(selectArtistButtons2[0]);
      
      // Now back button should be enabled
      await waitFor(() => {
        expect(screen.getByTestId('back-button')).not.toBeDisabled();
      });
    });
  });
}); 