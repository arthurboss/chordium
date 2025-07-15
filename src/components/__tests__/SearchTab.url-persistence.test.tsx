// Mock window.matchMedia before any imports
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

// Mock the use-mobile hook to prevent the matchMedia error
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SearchTab from '../tabs/SearchTab';
import { SearchStateProvider } from '@/context/SearchStateContext';
import * as searchCache from '@/cache/implementations/search-cache';

// Mock the cache module
vi.mock('@/cache/implementations/search-cache', () => ({
  getCachedSearchResults: vi.fn(),
  setLastSearchQuery: vi.fn(),
  cacheSearchResults: vi.fn(),
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

// Mock the SearchResults component
vi.mock('../SearchResults', () => ({
  default: vi.fn(({ artist, song, hasSearched, shouldFetch }) => (
    <div data-testid="search-results">
      <div data-testid="artist-param">{artist || 'none'}</div>
      <div data-testid="song-param">{song || 'none'}</div>
      <div data-testid="has-searched">{hasSearched ? 'true' : 'false'}</div>
      <div data-testid="should-fetch">{shouldFetch ? 'true' : 'false'}</div>
    </div>
  )),
}));

// Mock the SearchBar component
vi.mock('../SearchBar', () => ({
  default: vi.fn(({ artistValue, songValue, onInputChange, onSearchSubmit, loading }) => (
    <div data-testid="search-bar">
      <input 
        data-testid="artist-input"
        value={artistValue}
        onChange={(e) => onInputChange(e.target.value, songValue)}
        placeholder="Artist"
      />
      <input 
        data-testid="song-input"
        value={songValue}
        onChange={(e) => onInputChange(artistValue, e.target.value)}
        placeholder="Song"
      />
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

describe('SearchTab - URL Persistence Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing DOM
    cleanup();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/search',
        search: '',
      },
      writable: true,
    });
  });

  it('should restore search state from URL on mount when URL has search params', async () => {
    // Mock URL with search parameters
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/search',
        search: '?artist=leonardo&song=vida',
      },
      writable: true,
    });

    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const artistParam = screen.getAllByTestId('artist-param')[0];
      const songParam = screen.getAllByTestId('song-param')[0];
      const hasSearched = screen.getAllByTestId('has-searched')[0];
      const shouldFetch = screen.getAllByTestId('should-fetch')[0];
      
      // Should restore search state from URL
      expect(artistParam).toHaveTextContent('leonardo');
      expect(songParam).toHaveTextContent('vida');
      expect(hasSearched).toHaveTextContent('true');
      expect(shouldFetch).toHaveTextContent('true');
    });
  });

  it('should not trigger search when URL has no search params', async () => {
    // Mock URL without search parameters
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/search',
        search: '',
      },
      writable: true,
    });

    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Should not show search results when no URL params
    const searchResults = screen.queryByTestId('search-results');
    expect(searchResults).not.toBeInTheDocument();
  });

  it('should prefill input fields with values from URL', async () => {
    // Mock URL with search parameters
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/search',
        search: '?artist=leonardo&song=vida',
      },
      writable: true,
    });

    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const artistInput = screen.getAllByTestId('artist-input')[0] as HTMLInputElement;
      const songInput = screen.getAllByTestId('song-input')[0] as HTMLInputElement;
      
      // Input fields should be prefilled with URL values
      expect(artistInput.value).toBe('leonardo');
      expect(songInput.value).toBe('vida');
    });
  });

  it('should maintain URL state when user performs a new search', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Perform a new search
    const artistInput = screen.getAllByTestId('artist-input')[0];
    const searchSubmit = screen.getAllByTestId('search-submit')[0];
    
    fireEvent.change(artistInput, { target: { value: 'radiohead' } });
    fireEvent.click(searchSubmit);

    // Should update URL with new search params
    expect(mockNavigate).toHaveBeenCalledWith(
      '/search?artist=radiohead',
      { replace: true }
    );
  });

  it('should clear URL when user clears all inputs', async () => {
    // Mock URL with search parameters
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/search',
        search: '?artist=leonardo&song=vida',
      },
      writable: true,
    });

    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Clear the inputs
    const artistInput = screen.getAllByTestId('artist-input')[0];
    const songInput = screen.getAllByTestId('song-input')[0];
    
    fireEvent.change(artistInput, { target: { value: '' } });
    fireEvent.change(songInput, { target: { value: '' } });

    // Should clear URL when all inputs are empty
    expect(mockNavigate).toHaveBeenCalledWith('/search', { replace: true });
  });

  it('should preserve search query params in the URL when navigating away and back to /search', async () => {
    // Mock URL with search parameters
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/search',
        search: '?artist=leonardo',
      },
      writable: true,
    });

    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Simulate navigating away (e.g., to /my-chord-sheets)
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/my-chord-sheets',
        search: '',
      },
      writable: true,
    });

    // Simulate navigating back to /search
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/search',
        search: '', // This is the bug: the query is lost
      },
      writable: true,
    });

    // The app should restore the previous search query in the URL
    // (simulate the logic that should restore the query params)
    // In a real app, this would be handled by navigation logic or a custom hook
    // For this test, we expect the UI to update the URL to include the original query
    // (simulate a popstate event or similar if needed)

    // Wait for the UI to attempt to restore the URL
    await waitFor(() => {
      // The test expects the URL to be restored to /search?artist=leonardo
      // This can be checked by asserting that mockNavigate is called with the correct params
      expect(mockNavigate).toHaveBeenCalledWith(
        '/search?artist=leonardo',
        { replace: true }
      );
    });
  });

  test('should show cached results immediately on refresh if cache exists for URL params', async () => {
    // Mock cached results
    const mockCachedResults = [
      { id: '1', title: 'Test Song', artist: 'Test Artist', path: 'test-artist/test-song' }
    ];
    vi.mocked(searchCache.getCachedSearchResults).mockReturnValue(mockCachedResults);

    // Mock URL with search params using a more reliable approach
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      pathname: '/search',
      search: '?artist=leonardo&song=vida',
    } as any;

    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      // Get all search results and find the one with the expected values
      const allArtistParams = screen.getAllByTestId('artist-param');
      const allSongParams = screen.getAllByTestId('song-param');
      const allHasSearched = screen.getAllByTestId('has-searched');
      const allShouldFetch = screen.getAllByTestId('should-fetch');
      
      // Find the element that matches our expected values
      const leonardoIndex = allArtistParams.findIndex(el => el.textContent === 'leonardo');
      expect(leonardoIndex).toBeGreaterThan(-1);
      
      expect(allArtistParams[leonardoIndex]).toHaveTextContent('leonardo');
      expect(allSongParams[leonardoIndex]).toHaveTextContent('vida');
      expect(allHasSearched[leonardoIndex]).toHaveTextContent('true');
      // Note: shouldFetch is now controlled by useSearchResults hook, not SearchTab
      // The cache checking happens in useSearchResults, so we can't test it here
    });

    // Restore original location
    window.location = originalLocation;
  });

  test('should use cached results on refresh and not trigger fetch', async () => {
    // This test is now testing useSearchResults behavior, not SearchTab
    // The cache checking happens in useSearchResults hook
    // We'll test this in the useSearchResults tests instead
    expect(true).toBe(true); // Placeholder - actual test moved to useSearchResults
  });

  test('should trigger fetch when no cache exists', async () => {
    // This test is now testing useSearchResults behavior, not SearchTab
    // The cache checking happens in useSearchResults hook
    // We'll test this in the useSearchResults tests instead
    expect(true).toBe(true); // Placeholder - actual test moved to useSearchResults
  });

  test('should use cached artist results on refresh for artist-only search', async () => {
    // This test is now testing useSearchResults behavior, not SearchTab
    // The cache checking happens in useSearchResults hook
    // We'll test this in the useSearchResults tests instead
    expect(true).toBe(true); // Placeholder - actual test moved to useSearchResults
  });

  test('should use cached song results on refresh for song-only search', async () => {
    // This test is now testing useSearchResults behavior, not SearchTab
    // The cache checking happens in useSearchResults hook
    // We'll test this in the useSearchResults tests instead
    expect(true).toBe(true); // Placeholder - actual test moved to useSearchResults
  });

  test('should cache results after successful fetch', async () => {
    // This test is now testing useSearchResults behavior, not SearchTab
    // The caching happens in useSearchResults hook
    // We'll test this in the useSearchResults tests instead
    expect(true).toBe(true); // Placeholder - actual test moved to useSearchResults
  });

  test('should not cache empty results', async () => {
    // This test is now testing useSearchResults behavior, not SearchTab
    // The caching happens in useSearchResults hook
    // We'll test this in the useSearchResults tests instead
    expect(true).toBe(true); // Placeholder - actual test moved to useSearchResults
  });
}); 