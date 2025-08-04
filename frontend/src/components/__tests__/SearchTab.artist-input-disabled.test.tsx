import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SearchTab from '../tabs/SearchTab';
import { SearchStateProvider } from '@/search/context/SearchStateContext';

// Mock window.matchMedia before any imports
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

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
}));

// Mock the test utils
vi.mock('@/utils/test-utils/cy-attr', () => ({
  cyAttr: vi.fn(() => ({})),
}));

// Mock SearchResults component
vi.mock('@/search/components/SearchResults', () => ({
  default: vi.fn(({ filterArtist, filterSong, activeArtist, hasSearched, onArtistSelect }) => (
    <div data-testid="search-results">
      <div data-testid="filter-artist">{filterArtist || 'none'}</div>
      <div data-testid="filter-song">{filterSong || 'none'}</div>
      <div data-testid="active-artist">{activeArtist ? activeArtist.displayName : 'none'}</div>
      <div data-testid="has-searched">{hasSearched ? 'true' : 'false'}</div>
      <button 
        data-testid="select-artist" 
        onClick={() => {
          if (onArtistSelect) {
            onArtistSelect({ 
              id: 'test-artist', 
              displayName: 'Test Artist', 
              path: 'test-artist',
              slug: 'test-artist'
            });
          }
        }}
      >
        Select Artist
      </button>
    </div>
  )),
}));

// Mock SearchBar component with artistDisabled prop tracking
let mockArtistDisabled = false;
vi.mock('../SearchBar', () => ({
  default: vi.fn(({ 
    artistValue, 
    songValue, 
    onInputChange, 
    onSearchSubmit, 
    showBackButton, 
    onBackClick, 
    onClearSearch, 
    clearDisabled,
    artistDisabled 
  }) => {
    mockArtistDisabled = artistDisabled;
    return (
      <div data-testid="search-bar">
        <input 
          data-testid="artist-input"
          value={artistValue}
          onChange={(e) => onInputChange(e.target.value, songValue)}
          placeholder="Artist"
          disabled={artistDisabled}
        />
        <input 
          data-testid="song-input"
          value={songValue}
          onChange={(e) => onInputChange(artistValue, e.target.value)}
          placeholder="Song"
        />
        <div data-testid="artist-disabled">{artistDisabled ? 'true' : 'false'}</div>
        <div data-testid="show-back-button">{showBackButton ? 'true' : 'false'}</div>
        <button 
          data-testid="back-button"
          onClick={onBackClick}
          disabled={!showBackButton || !onBackClick}
        >
          Back
        </button>
        <button
          type="button"
          data-testid="clear-search-button"
          onClick={onClearSearch}
          disabled={!!clearDisabled}
        >
          🗑️
        </button>
        <button data-testid="search-submit" onClick={() => onSearchSubmit(artistValue, songValue)}>Search</button>
      </div>
    );
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SearchTab - Artist Input Disabled Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockArtistDisabled = false;
    // Reset mock functions
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/search',
        search: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Clean up any remaining components
    cleanup();
  });

  it('should disable artist input when an artist is selected', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Perform an artist search
    const artistInput = screen.getByTestId('artist-input');
    const searchSubmit = screen.getByTestId('search-submit');
    
    fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
    fireEvent.click(searchSubmit);

    // Initially, artist input should not be disabled
    expect(screen.getByTestId('artist-disabled')).toHaveTextContent('false');

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // After selecting an artist, the artist input should be disabled
    await waitFor(() => {
      expect(screen.getByTestId('artist-disabled')).toHaveTextContent('true');
    });
  });

  it('should enable artist input when artist selection is cleared', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Perform an artist search
    const artistInput = screen.getByTestId('artist-input');
    const searchSubmit = screen.getByTestId('search-submit');
    
    fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
    fireEvent.click(searchSubmit);

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // Verify artist input is disabled
    await waitFor(() => {
      expect(screen.getByTestId('artist-disabled')).toHaveTextContent('true');
    });

    // Click back button to clear artist selection
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    // Artist input should be enabled again
    await waitFor(() => {
      expect(screen.getByTestId('artist-disabled')).toHaveTextContent('false');
    });
  });

  it('should enable artist input when clear search is clicked', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Perform an artist search
    const artistInput = screen.getByTestId('artist-input');
    const searchSubmit = screen.getByTestId('search-submit');
    
    fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
    fireEvent.click(searchSubmit);

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // Verify artist input is disabled
    await waitFor(() => {
      expect(screen.getByTestId('artist-disabled')).toHaveTextContent('true');
    });

    // Click clear search button
    const clearButton = screen.getByTestId('clear-search-button');
    fireEvent.click(clearButton);

    // Artist input should be enabled again
    await waitFor(() => {
      expect(screen.getByTestId('artist-disabled')).toHaveTextContent('false');
    });
  });

  it('should not disable artist input for song-only searches', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Perform a song-only search
    const songInput = screen.getByTestId('song-input');
    const searchSubmit = screen.getByTestId('search-submit');
    
    fireEvent.change(songInput, { target: { value: 'Test Song' } });
    fireEvent.click(searchSubmit);

    // Artist input should remain enabled for song-only searches
    await waitFor(() => {
      expect(screen.getByTestId('artist-disabled')).toHaveTextContent('false');
    });
  });

  it('should not disable artist input when no artist is selected', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Perform an artist search but don't select an artist
    const artistInput = screen.getByTestId('artist-input');
    const searchSubmit = screen.getByTestId('search-submit');
    
    fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
    fireEvent.click(searchSubmit);

    // Artist input should remain enabled when no artist is selected
    await waitFor(() => {
      expect(screen.getByTestId('artist-disabled')).toHaveTextContent('false');
    });
  });

  it('should show back button when artist is selected', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Perform an artist search
    const artistInput = screen.getByTestId('artist-input');
    const searchSubmit = screen.getByTestId('search-submit');
    
    fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
    fireEvent.click(searchSubmit);

    // Initially, back button should not be shown
    expect(screen.getByTestId('show-back-button')).toHaveTextContent('false');

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // After selecting an artist, back button should be shown
    await waitFor(() => {
      expect(screen.getByTestId('show-back-button')).toHaveTextContent('true');
    });
  });

  it('should hide back button when artist selection is cleared', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Perform an artist search
    const artistInput = screen.getByTestId('artist-input');
    const searchSubmit = screen.getByTestId('search-submit');
    
    fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
    fireEvent.click(searchSubmit);

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // Verify back button is shown
    await waitFor(() => {
      expect(screen.getByTestId('show-back-button')).toHaveTextContent('true');
    });

    // Click back button to clear artist selection
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    // Back button should be hidden again
    await waitFor(() => {
      expect(screen.getByTestId('show-back-button')).toHaveTextContent('false');
    });
  });

  it('should maintain song input functionality when artist is selected', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Perform an artist search
    const artistInput = screen.getByTestId('artist-input');
    const songInput = screen.getByTestId('song-input');
    const searchSubmit = screen.getByTestId('search-submit');
    
    fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
    fireEvent.click(searchSubmit);

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // Verify artist input is disabled
    await waitFor(() => {
      expect(screen.getByTestId('artist-disabled')).toHaveTextContent('true');
    });

    // Song input should still be functional
    fireEvent.change(songInput, { target: { value: 'New Song' } });
    
    // Verify song input value changed
    expect(songInput).toHaveValue('New Song');
  });

  it('should clear artist selection when new search is performed', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Perform an artist search
    const artistInput = screen.getByTestId('artist-input');
    const searchSubmit = screen.getByTestId('search-submit');
    
    fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
    fireEvent.click(searchSubmit);

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // Verify artist input is disabled
    await waitFor(() => {
      expect(screen.getByTestId('artist-disabled')).toHaveTextContent('true');
    });

    // Perform a new search
    fireEvent.change(artistInput, { target: { value: 'New Artist' } });
    fireEvent.click(searchSubmit);

    // Artist input should be enabled again for new search
    await waitFor(() => {
      expect(screen.getByTestId('artist-disabled')).toHaveTextContent('false');
    });
  });
}); 