import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';
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
  default: vi.fn(({ filterArtist, filterSong, activeArtist, hasSearched, onArtistSelect }) => (
    <div data-testid="search-results">
      <div data-testid="filter-artist">{filterArtist || 'none'}</div>
      <div data-testid="filter-song">{filterSong || 'none'}</div>
      <div data-testid="active-artist">{activeArtist ? activeArtist.displayName : 'none'}</div>
      <div data-testid="has-searched">{hasSearched ? 'true' : 'false'}</div>
      <button 
        data-testid="select-artist" 
        onClick={() => {
          // Simulate artist selection by calling the onArtistSelect prop
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

// Mock the SearchBar component
vi.mock('../SearchBar', () => ({
  default: vi.fn(({ artistValue, songValue, onInputChange, onSearchSubmit, showBackButton, onBackClick }) => (
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
      <div data-testid="show-back-button">{showBackButton ? 'true' : 'false'}</div>
      <button 
        data-testid="back-button"
        onClick={onBackClick}
        disabled={!showBackButton || !onBackClick}
      >
        Back
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

describe('SearchTab - Filtering Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/search',
        search: '',
      },
      writable: true,
    });
  });

  it('should disable artist filtering when an artist is selected', async () => {
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

    await waitFor(() => {
      const searchResults = screen.getByTestId('search-results');
      const filterArtist = searchResults.querySelector('[data-testid="filter-artist"]');
      const activeArtist = searchResults.querySelector('[data-testid="active-artist"]');
      
      // When artist is selected, filterArtist should use searchState.artist (no local filtering)
      expect(filterArtist?.textContent).toBe('Test Artist');
      expect(activeArtist?.textContent).toBe('Test Artist');
    });
  });

  it('should allow artist filtering for song-only search', async () => {
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

    // Type in artist field for local filtering
    const artistInput = screen.getByTestId('artist-input');
    fireEvent.change(artistInput, { target: { value: 'Filter Artist' } });

    await waitFor(() => {
      const searchResults = screen.getByTestId('search-results');
      const filterArtist = searchResults.querySelector('[data-testid="filter-artist"]');
      const filterSong = searchResults.querySelector('[data-testid="filter-song"]');
      
      // For song-only search, both fields should allow local filtering
      expect(filterArtist?.textContent).toBe('Filter Artist');
      expect(filterSong?.textContent).toBe('Test Song');
    });
  });

  it('should allow both artist and song filtering for artist search without selection', async () => {
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

    // Type in both fields for local filtering
    const songInput = screen.getByTestId('song-input');
    fireEvent.change(artistInput, { target: { value: 'Filter Artist' } });
    fireEvent.change(songInput, { target: { value: 'Filter Song' } });

    await waitFor(() => {
      const searchResults = screen.getByTestId('search-results');
      const filterArtist = searchResults.querySelector('[data-testid="filter-artist"]');
      const filterSong = searchResults.querySelector('[data-testid="filter-song"]');
      
      // For artist search without selection, both fields should allow local filtering
      expect(filterArtist?.textContent).toBe('Filter Artist');
      expect(filterSong?.textContent).toBe('Filter Song');
    });
  });

  it('should not allow artist filtering when artist is selected but allow song filtering', async () => {
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

    // Try to filter by artist and song
    fireEvent.change(artistInput, { target: { value: 'Filter Artist' } });
    const songInput = screen.getByTestId('song-input');
    fireEvent.change(songInput, { target: { value: 'Filter Song' } });

    await waitFor(() => {
      const searchResults = screen.getByTestId('search-results');
      const filterArtist = searchResults.querySelector('[data-testid="filter-artist"]');
      const filterSong = searchResults.querySelector('[data-testid="filter-song"]');
      
      // Artist filtering should be disabled (locked to original search)
      expect(filterArtist?.textContent).toBe('Test Artist');
      // Song filtering should still work
      expect(filterSong?.textContent).toBe('Filter Song');
    });
  });
}); 