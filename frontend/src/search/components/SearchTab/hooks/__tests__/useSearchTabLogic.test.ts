import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SearchStateProvider } from '../../../../context';
import { useSearchTabLogic } from '../useSearchTabLogic';

// Mock dependencies
const mockNavigate = vi.fn();
const mockUpdateSearchState = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/search', search: '?artist=hillsong' })
}));

vi.mock('../../../../context', () => ({
  useSearchState: () => ({
    searchState: { query: { artist: '', song: '' }, searchType: 'artist', results: [] },
    updateSearchState: mockUpdateSearchState
  }),
  SearchStateProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('@/hooks/navigation', () => ({
  useNavigation: () => ({
    navigateToArtist: vi.fn(),
    isOnArtistPage: () => false,
    getCurrentArtistPath: () => null
  })
}));

vi.mock('../useInitSearchStateEffect', () => ({
  useInitSearchStateEffect: vi.fn()
}));

vi.mock('../useInitArtistPageEffect', () => ({
  useInitArtistPageEffect: vi.fn()
}));

describe('useSearchTabLogic - Original Search Query Preservation', () => {
  const mockProps = {
    setMySongs: vi.fn(),
    setActiveTab: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should preserve original search query when submitting search', () => {
    const { result } = renderHook(() => useSearchTabLogic(mockProps), {
      wrapper: SearchStateProvider
    });

    act(() => {
      result.current.handleSearchSubmit('hillsong', '');
    });

    // The original search query should be preserved
    expect(result.current.submittedArtist).toBe('hillsong');
    expect(result.current.submittedSong).toBe('');
  });

  it('should use original search query when navigating back from artist page', () => {
    const { result } = renderHook(() => useSearchTabLogic(mockProps), {
      wrapper: SearchStateProvider
    });

    // First, submit a search
    act(() => {
      result.current.handleSearchSubmit('hillsong', '');
    });

    // Then navigate back (simulating being on an artist page)
    act(() => {
      result.current.handleBackToArtistList();
    });

    // Should navigate back to the original search query, not the artist's display name
    expect(mockNavigate).toHaveBeenCalledWith('/search?artist=hillsong', { replace: true });
  });

  it('should clear original search query when clearing search', () => {
    const { result } = renderHook(() => useSearchTabLogic(mockProps), {
      wrapper: SearchStateProvider
    });

    // First, submit a search
    act(() => {
      result.current.handleSearchSubmit('hillsong', 'oceans');
    });

    // Then clear the search
    act(() => {
      result.current.handleClearSearch();
    });

    // All search state should be cleared
    expect(result.current.artistInput).toBe('');
    expect(result.current.songInput).toBe('');
    expect(result.current.submittedArtist).toBe('');
    expect(result.current.submittedSong).toBe('');
    expect(result.current.hasSearched).toBe(false);
  });
});
