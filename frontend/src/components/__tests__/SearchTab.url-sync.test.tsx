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
import { SearchStateProvider } from '@/search/context';

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
  default: vi.fn(({ onArtistSelect, onSongSelect, filterArtist, filterSong }) => (
    <div data-testid="search-results">
      <div data-testid="filter-artist">{filterArtist || 'none'}</div>
      <div data-testid="filter-song">{filterSong || 'none'}</div>
      <button 
        data-testid="select-artist" 
        onClick={() => onArtistSelect({ id: 'test-artist', name: 'Test Artist', path: 'test-artist' })}
      >
        Select Artist
      </button>
      <button 
        data-testid="select-song" 
        onClick={() => onSongSelect({ id: 'test-song', name: 'Test Song', artist: 'Test Artist' })}
      >
        Select Song
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
      <button data-testid="search-submit" onClick={onSearchSubmit}>Search</button>
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

describe('SearchTab - URL Synchronization', () => {
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

  it('should update URL when artist input is cleared', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Set initial values
    const artistInput = screen.getAllByTestId('artist-input')[0];
    const songInput = screen.getAllByTestId('song-input')[0];

    // Set both inputs
    fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
    fireEvent.change(songInput, { target: { value: 'Test Song' } });

    // Clear the artist input
    fireEvent.change(artistInput, { target: { value: '' } });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search?song=test-song', { replace: true });
    });
  });

  it('should update URL when song input is cleared', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Set initial values
    const artistInput = screen.getAllByTestId('artist-input')[0];
    const songInput = screen.getAllByTestId('song-input')[0];

    // Set both inputs
    fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
    fireEvent.change(songInput, { target: { value: 'Test Song' } });

    // Clear the song input
    fireEvent.change(songInput, { target: { value: '' } });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search?artist=test-artist', { replace: true });
    });
  });

  it('should update URL to remove both params when both inputs are cleared', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    // Set initial values
    const artistInput = screen.getAllByTestId('artist-input')[0];
    const songInput = screen.getAllByTestId('song-input')[0];

    // Set both inputs
    fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
    fireEvent.change(songInput, { target: { value: 'Test Song' } });

    // Clear both inputs
    fireEvent.change(artistInput, { target: { value: '' } });
    fireEvent.change(songInput, { target: { value: '' } });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search', { replace: true });
    });
  });

  it('should not trigger URL update when input is set (only when cleared)', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    const artistInput = screen.getAllByTestId('artist-input')[0];

    // Set the input (should not trigger URL update)
    fireEvent.change(artistInput, { target: { value: 'New Artist' } });

    // Wait a bit to ensure no navigation occurs
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not have called navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle special characters in input values correctly', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    const artistInput = screen.getAllByTestId('artist-input')[0];

    // Set input with special characters (should not trigger URL update)
    fireEvent.change(artistInput, { target: { value: 'AC/DC' } });

    // Wait a bit to ensure no navigation occurs
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not have called navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should maintain existing URL params when only one input is cleared', async () => {
    render(
      <BrowserRouter>
        <SearchStateProvider>
          <SearchTab myChordSheets={[]} />
        </SearchStateProvider>
      </BrowserRouter>
    );

    const artistInput = screen.getAllByTestId('artist-input')[0];
    const songInput = screen.getAllByTestId('song-input')[0];

    // Set both inputs
    fireEvent.change(artistInput, { target: { value: 'Artist One' } });
    fireEvent.change(songInput, { target: { value: 'Song One' } });

    // Clear only the artist input
    fireEvent.change(artistInput, { target: { value: '' } });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search?song=song-one', { replace: true });
    });
  });
}); 