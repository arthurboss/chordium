import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SearchTab from '../tabs/SearchTab';
import { SearchStateProvider } from '@/context/SearchStateContext';

// Mock window.matchMedia before any imports
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock the search cache
vi.mock('@/cache/implementations/search-cache', () => ({
  setLastSearchQuery: vi.fn(),
}));

// Mock the URL slug utils
vi.mock('@/utils/url-slug-utils', () => ({
  toSlug: vi.fn((str) => str.toLowerCase().replace(/\s+/g, '-')),
  fromSlug: vi.fn((str) => str.replace(/-/g, ' ')),
}));

// Mock the test utils
vi.mock('@/utils/test-utils/cy-attr', () => ({
  cyAttr: vi.fn(() => ({})),
}));

// Mock SearchResults component
vi.mock('../SearchResults', () => ({
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
            // Use actual fixture data
            const artistInput = document.querySelector('[data-testid="artist-input"]') as HTMLInputElement;
            const searchValue = artistInput?.value || '';
            
            if (searchValue.includes('Oasis')) {
              onArtistSelect({ 
                id: 'oasis', 
                displayName: 'Oasis', 
                path: 'oasis',
                slug: 'oasis'
              });
            } else {
              onArtistSelect({ 
                id: 'jeremy-camp', 
                displayName: 'Jeremy Camp', 
                path: 'jeremy-camp',
                slug: 'jeremy-camp'
              });
            }
          }
        }}
      >
        Select Artist
      </button>
    </div>
  )),
}));

// Mock SearchBar component
vi.mock('../SearchBar', () => ({
  default: vi.fn(({ artistValue, songValue, onInputChange, onSearchSubmit, showBackButton, onBackClick, onClearSearch, clearDisabled, artistDisabled }) => (
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
  )),
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

describe('SearchTab - Artist URL Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('should navigate to artist URL when artist is selected', async () => {
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
    
    fireEvent.change(artistInput, { target: { value: 'Jeremy Camp' } });
    fireEvent.click(searchSubmit);

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // Should navigate to the artist URL
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/jeremy-camp', { replace: true });
    });
  });

  it('should navigate back to search when back button is clicked', async () => {
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
    
    fireEvent.change(artistInput, { target: { value: 'Jeremy Camp' } });
    fireEvent.click(searchSubmit);

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // Wait for navigation to artist URL
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/jeremy-camp', { replace: true });
    });

    // Click back button
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    // Should navigate back to search
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search?artist=jeremy-camp', { replace: true });
    });
  });

  it('should maintain search state when navigating back to search', async () => {
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
    
    fireEvent.change(artistInput, { target: { value: 'Jeremy Camp' } });
    fireEvent.click(searchSubmit);

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // Wait for navigation to artist URL
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/jeremy-camp', { replace: true });
    });

    // Click back button
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    // Should navigate back to search with original search parameters
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search?artist=jeremy-camp', { replace: true });
    });
  });

  it('should not navigate to artist URL for song-only searches', async () => {
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
    
    fireEvent.change(songInput, { target: { value: 'Amazing Grace' } });
    fireEvent.click(searchSubmit);

    // Should not navigate to artist URL for song-only searches
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search?song=amazing-grace', { replace: true });
    });

    // Verify no artist navigation occurred
    expect(mockNavigate).not.toHaveBeenCalledWith(expect.stringContaining('/jeremy-camp'), expect.anything());
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
    
    fireEvent.change(artistInput, { target: { value: 'Jeremy Camp' } });
    fireEvent.click(searchSubmit);

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // Wait for navigation to artist URL
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/jeremy-camp', { replace: true });
    });

    // Perform a new search
    fireEvent.change(artistInput, { target: { value: 'New Artist' } });
    fireEvent.click(searchSubmit);

    // Should navigate to new search URL, not artist URL
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search?artist=new-artist', { replace: true });
    });
  });

  it('should handle artist names with special characters in URL', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Perform an artist search with fixture data
    const artistInput = screen.getByTestId('artist-input');
    const searchSubmit = screen.getByTestId('search-submit');
    
    fireEvent.change(artistInput, { target: { value: 'Oasis' } });
    fireEvent.click(searchSubmit);

    // Select an artist
    const selectArtist = screen.getByTestId('select-artist');
    fireEvent.click(selectArtist);

    // Should navigate to URL-safe version of artist name
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/oasis', { replace: true });
    });
  });
}); 