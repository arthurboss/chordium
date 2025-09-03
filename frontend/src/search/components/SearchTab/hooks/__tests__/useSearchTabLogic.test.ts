import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSearchTabLogic } from "../useSearchTabLogic";

// Mock dependencies
vi.mock("@/hooks/navigation", () => ({
  useNavigation: () => ({
    navigateToArtist: vi.fn(),
    isOnArtistPage: () => false,
    getCurrentArtistPath: () => "",
  }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/search", search: "" }),
}));

// Mock the effect hooks
vi.mock("../useInitSearchStateEffect", () => ({
  useInitSearchStateEffect: vi.fn(),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

// Mock useTransition
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useTransition: () => [false, vi.fn()],
  };
});

// Mock useSearchReducer
vi.mock("@/search", () => ({
  useSearchReducer: () => ({
    artists: [],
    songs: [],
    artistSongs: [],
    stateData: {
      state: 'default',
      searchType: 'artist',
      activeArtist: null,
      isEmpty: false,
      emptyMessage: '',
    },
    handleView: vi.fn(),
    handleArtistSelect: vi.fn(),
    clearSearch: vi.fn(),
  }),
}));

describe("useSearchTabLogic", () => {
  const defaultProps = {
    setMySongs: vi.fn(),
    setActiveTab: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset session storage mock
    mockSessionStorage.getItem.mockReturnValue(null);
    mockSessionStorage.setItem.mockClear();
    mockSessionStorage.removeItem.mockClear();
  });

  it('should render without crashing', () => {
    // Simple test to ensure the hook doesn't crash
    expect(() => {
      renderHook(() => useSearchTabLogic(defaultProps));
    }).not.toThrow();
  });

  it('should have the expected interface', () => {
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));
    
    // Test that the hook returns the expected functions and properties
    expect(result.current).toHaveProperty('artistInput');
    expect(result.current).toHaveProperty('songInput');
    expect(result.current).toHaveProperty('handleInputChange');
    expect(result.current).toHaveProperty('handleClearSearch');
    expect(result.current).toHaveProperty('hasSearched');
    expect(result.current).toHaveProperty('clearDisabled');
    expect(result.current).toHaveProperty('handleSearchSubmit');
    expect(result.current).toHaveProperty('handleArtistSelect');
    expect(result.current).toHaveProperty('handleBackToArtistList');
  });

  it('should handle input changes correctly', () => {
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));
    
    // Test that handleInputChange is callable
    expect(typeof result.current.handleInputChange).toBe('function');
    
    // Test input change functionality
    act(() => {
      result.current.handleInputChange("Test Artist", "Test Song");
    });
    
    expect(result.current.artistInput).toBe("Test Artist");
    expect(result.current.songInput).toBe("Test Song");
  });

  it('should handle individual field clearing without affecting other fields', () => {
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));
    
    // Set initial state
    act(() => {
      result.current.handleInputChange("Test Artist", "Test Song");
    });
    
    // Verify initial state
    expect(result.current.artistInput).toBe("Test Artist");
    expect(result.current.songInput).toBe("Test Song");
    
    // Clear only the artist field
    act(() => {
      result.current.handleInputChange("", "Test Song");
    });
    
    // Verify artist field is cleared but song field remains
    expect(result.current.artistInput).toBe("");
    expect(result.current.songInput).toBe("Test Song");
    
    // Clear only the song field
    act(() => {
      result.current.handleInputChange("Test Artist", "");
    });
    
    // Verify song field is cleared but artist field is restored
    expect(result.current.artistInput).toBe("Test Artist");
    expect(result.current.songInput).toBe("");
  });

  it('should handle clear disabled state correctly', () => {
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));
    
    // Initially should be disabled (no inputs)
    expect(result.current.clearDisabled).toBe(true);
    
    // Add some input
    act(() => {
      result.current.handleInputChange("Test Artist", "");
    });
    
    // Should be enabled when there's input
    expect(result.current.clearDisabled).toBe(false);
    
    // Clear all inputs
    act(() => {
      result.current.handleInputChange("", "");
    });
    
    // Should be disabled again
    expect(result.current.clearDisabled).toBe(true);
  });

  it('should handle session storage errors gracefully', () => {
    // Mock session storage to throw an error
    mockSessionStorage.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));
    
    // Should not crash when session storage fails
    expect(() => {
      act(() => {
        result.current.handleSearchSubmit("Test Artist", "Test Song");
      });
    }).not.toThrow();
    
    // Should still update local state even if session storage fails
    expect(result.current.submittedArtist).toBe("Test Artist");
    expect(result.current.submittedSong).toBe("Test Song");
  });
});
