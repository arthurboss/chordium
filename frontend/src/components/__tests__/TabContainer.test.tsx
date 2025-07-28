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

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
  disconnect() {
    // Mock implementation
  }
};

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import TabContainer from '../TabContainer';
import { Song } from '@/types/song';

// Mock dependencies
vi.mock('@/hooks/useTabStatePersistence', () => ({
  useTabStatePersistence: () => ({
    getTabState: vi.fn(() => ({ scroll: 0 })),
    setTabState: vi.fn(),
  }),
}));

const mockUseSearchState = vi.fn();
vi.mock('@/context/SearchStateContext', () => ({
  SearchStateProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSearchState: () => mockUseSearchState(),
}));

vi.mock('@/utils/scroll-utils', () => ({
  scrollToElement: vi.fn(),
}));

vi.mock('@/utils/chord-sheet-storage', () => ({
  handleDeleteChordSheetFromUI: vi.fn(),
  handleUpdateChordSheetFromUI: vi.fn(),
  handleSaveNewChordSheetFromUI: vi.fn(),
}));

vi.mock('@/utils/test-utils', () => ({
  cyAttr: vi.fn(() => ({})),
}));

vi.mock('@/utils/url-slug-utils', () => ({
  toSlug: vi.fn((str) => str.toLowerCase().replace(/\s+/g, '-')),
}));

vi.mock('@/cache/implementations/unified-chord-sheet-cache', () => ({
  unifiedChordSheetCache: {
    getCachedChordSheet: vi.fn(() => null),
  },
}));

vi.mock('@/constants/guitar-tunings', () => ({
  GUITAR_TUNINGS: {
    STANDARD: 'E A D G B E',
  },
}));

// Mock child components
vi.mock('../tabs/SearchTab', () => ({
  default: vi.fn(() => <div data-testid="search-tab">Search Tab Content</div>),
}));

vi.mock('../tabs/UploadTab', () => ({
  default: vi.fn(() => <div data-testid="upload-tab">Upload Tab Content</div>),
}));

vi.mock('../SongList', () => ({
  default: vi.fn(() => <div data-testid="song-list">Song List Content</div>),
}));

vi.mock('../SongViewer', () => ({
  default: vi.fn(() => <div data-testid="song-viewer">Song Viewer Content</div>),
}));

// Mock router hooks
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

describe('TabContainer', () => {
  const defaultProps = {
    activeTab: 'search',
    setActiveTab: vi.fn(),
    myChordSheets: [] as Song[],
    setMySongs: vi.fn(),
    selectedSong: null,
    setSelectedSong: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    
    // Default mocks
    mockUseSearchState.mockReturnValue({
      searchState: { artist: '', song: '', results: [] },
    });
    
    mockUseLocation.mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderTabContainer = (props = {}) => {
    return render(
      <MemoryRouter>
        <TabContainer {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  describe('Tab Navigation', () => {
    it('should render all three tabs', () => {
      renderTabContainer();

      expect(screen.getByText('My Chord Sheets')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('should show active tab content', () => {
      renderTabContainer({ activeTab: 'search' });
      expect(screen.getByTestId('search-tab')).toBeInTheDocument();
    });

    it('should call setActiveTab when tab is clicked', async () => {
      const setActiveTab = vi.fn();
      renderTabContainer({ setActiveTab });

      const uploadTab = screen.getByText('Upload');
      await userEvent.click(uploadTab);

      expect(setActiveTab).toHaveBeenCalledWith('upload');
    });

    it('should navigate to correct routes when tabs are clicked', async () => {
      renderTabContainer();

      const uploadTab = screen.getByText('Upload');
      await userEvent.click(uploadTab);

      expect(mockNavigate).toHaveBeenCalledWith('/upload');
    });

    it('should call setSelectedSong(null) when switching tabs', async () => {
      const setSelectedSong = vi.fn();
      renderTabContainer({ setSelectedSong });

      const uploadTab = screen.getByText('Upload');
      await userEvent.click(uploadTab);

      expect(setSelectedSong).toHaveBeenCalledWith(null);
    });
  });

  describe('URL Preservation Logic', () => {
    it('should preserve original search URL when switching tabs', async () => {
      // Start on an artist page
      mockUseLocation.mockReturnValue({
        pathname: '/alicia-keys',
        search: '',
        hash: '',
        state: null,
        key: 'test'
      });

      const { rerender } = renderTabContainer({ activeTab: 'search' });

      // Wait for useEffect to store URL
      await new Promise(resolve => setTimeout(resolve, 10));

      // Simulate switching to upload tab (which would clear the mock)
      mockNavigate.mockClear();

      // Now switch to search tab from different tab
      rerender(
        <MemoryRouter>
          <TabContainer {...defaultProps} activeTab="upload" />
        </MemoryRouter>
      );

      const searchTab = screen.getByText('Search');
      await userEvent.click(searchTab);

      // Should navigate to the preserved URL
      expect(mockNavigate).toHaveBeenCalledWith('/alicia-keys');
    });

    it('should not store basic app tab URLs', async () => {
      // Start on my-chord-sheets page
      mockUseLocation.mockReturnValue({
        pathname: '/my-chord-sheets',
        search: '',
        hash: '',
        state: null,
        key: 'test'
      });

      renderTabContainer({ activeTab: 'my-chord-sheets' });

      // Wait for useEffect
      await new Promise(resolve => setTimeout(resolve, 10));

      // Clear navigate calls
      mockNavigate.mockClear();

      // Switch to search tab - should not use the stored /my-chord-sheets URL
      const searchTab = screen.getByText('Search');
      await userEvent.click(searchTab);

      // Should fallback to basic search page since no valid search URL was stored
      expect(mockNavigate).toHaveBeenCalledWith('/search');
    });

    it('should store search page URLs with parameters', async () => {
      // Start on search page with params
      mockUseLocation.mockReturnValue({
        pathname: '/search',
        search: '?artist=alicia-keys&song=fallin',
        hash: '',
        state: null,
        key: 'test'
      });

      const { rerender } = renderTabContainer({ activeTab: 'search' });

      // Wait for useEffect to store URL
      await new Promise(resolve => setTimeout(resolve, 10));

      // Simulate switching to upload tab and rerender
      rerender(
        <MemoryRouter>
          <TabContainer {...defaultProps} activeTab="upload" />
        </MemoryRouter>
      );

      // Clear previous navigate calls
      mockNavigate.mockClear();

      // Switch back to search tab
      const searchTab = screen.getByText('Search');
      await userEvent.click(searchTab);

      // Should navigate to the preserved search URL with parameters
      expect(mockNavigate).toHaveBeenCalledWith('/search?artist=alicia-keys&song=fallin');
    });

    it('should fallback to search state when no preserved URL exists', async () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'test'
      });

      mockUseSearchState.mockReturnValue({
        searchState: { artist: 'test artist', song: '', results: [] },
      });

      renderTabContainer({ activeTab: 'upload' });

      const searchTab = screen.getByText('Search');
      await userEvent.click(searchTab);

      // Should construct URL from search state
      expect(mockNavigate).toHaveBeenCalledWith('/search?artist=test-artist');
    });

    it('should fallback to basic search page when no URL or state exists', async () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'test'
      });

      mockUseSearchState.mockReturnValue({
        searchState: { artist: '', song: '', results: [] },
      });

      renderTabContainer({ activeTab: 'upload' });

      const searchTab = screen.getByText('Search');
      await userEvent.click(searchTab);

      expect(mockNavigate).toHaveBeenCalledWith('/search');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle Enter key on tabs', async () => {
      const setActiveTab = vi.fn();
      renderTabContainer({ setActiveTab });

      const searchTab = screen.getByText('Search');
      fireEvent.keyDown(searchTab, { key: 'Enter' });

      expect(setActiveTab).toHaveBeenCalledWith('search');
    });

    it('should handle Space key on tabs', async () => {
      const setActiveTab = vi.fn();
      renderTabContainer({ setActiveTab });

      const uploadTab = screen.getByText('Upload');
      fireEvent.keyDown(uploadTab, { key: ' ' });

      expect(setActiveTab).toHaveBeenCalledWith('upload');
    });
  });

  describe('My Chord Sheets Tab', () => {
    it('should show song list when no song is selected', () => {
      renderTabContainer({ activeTab: 'my-chord-sheets', selectedSong: null });
      expect(screen.getByTestId('song-list')).toBeInTheDocument();
    });

    it('should show song viewer when a song is selected', () => {
      const mockSong: Song = {
        title: 'Test Song',
        artist: 'Test Artist',
        path: 'test-path',
      };
      
      renderTabContainer({ 
        activeTab: 'my-chord-sheets', 
        selectedSong: mockSong 
      });
      
      expect(screen.getByTestId('song-viewer')).toBeInTheDocument();
    });
  });

  describe('Tab Content Persistence', () => {
    it('should always render all tab contents but hide inactive ones', () => {
      renderTabContainer({ activeTab: 'search' });

      // All tabs should be rendered but hidden with CSS
      expect(screen.getByTestId('search-tab')).toBeInTheDocument();
      expect(screen.getByTestId('upload-tab')).toBeInTheDocument();
      expect(screen.getByTestId('song-list')).toBeInTheDocument();
    });

    it('should use CSS display property to show/hide tabs', () => {
      renderTabContainer({ activeTab: 'upload' });

      const searchDiv = screen.getByTestId('search-tab').parentElement;
      const uploadDiv = screen.getByTestId('upload-tab').parentElement;

      expect(searchDiv).toHaveStyle({ display: 'none' });
      expect(uploadDiv).toHaveStyle({ display: 'block' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty myChordSheets array', () => {
      renderTabContainer({ 
        activeTab: 'my-chord-sheets', 
        myChordSheets: [] 
      });
      
      expect(screen.getByTestId('song-list')).toBeInTheDocument();
    });
  });
});
