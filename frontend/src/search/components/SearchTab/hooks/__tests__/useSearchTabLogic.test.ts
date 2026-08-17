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

// Mock useTransition - runs its callback synchronously, same as real
// startTransition does for the state updates inside it; only the "is this
// deferred" pending flag is faked.
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useTransition: () => [false, (callback: () => void) => callback()],
  };
});

// Mock useSearchReducer
vi.mock("@/search", () => ({
  useSearchReducer: () => ({
    hits: [],
    artistSongs: [],
    filteredArtistSongs: [],
    stateData: {
      state: 'default',
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
    expect(() => {
      renderHook(() => useSearchTabLogic(defaultProps));
    }).not.toThrow();
  });

  it('should have the expected interface', () => {
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));

    expect(result.current).toHaveProperty('input');
    expect(result.current).toHaveProperty('submittedQuery');
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

    expect(typeof result.current.handleInputChange).toBe('function');

    act(() => {
      result.current.handleInputChange("eagles hotel california");
    });

    expect(result.current.input).toBe("eagles hotel california");
  });

  it('keeps the submitted search when the field is emptied', () => {
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));

    act(() => {
      result.current.handleSearchSubmit("eagles");
    });
    expect(result.current.submittedQuery).toBe("eagles");

    // Emptying the field must not discard the results already on screen: only the
    // trash button does that.
    act(() => {
      result.current.handleInputChange("");
    });

    expect(result.current.input).toBe("");
    expect(result.current.submittedQuery).toBe("eagles");
    expect(result.current.hasSearched).toBe(true);
  });

  it('ignores a submit with nothing but whitespace', () => {
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));

    act(() => {
      result.current.handleSearchSubmit("   ");
    });

    expect(result.current.submittedQuery).toBe("");
    expect(result.current.hasSearched).toBe(false);
  });

  it('trims the search before submitting it', () => {
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));

    act(() => {
      result.current.handleSearchSubmit("  legiao urbana tempo perdido  ");
    });

    expect(result.current.submittedQuery).toBe("legiao urbana tempo perdido");
  });

  it('should handle clear disabled state correctly', () => {
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));

    // Initially should be disabled (no input)
    expect(result.current.clearDisabled).toBe(true);

    act(() => {
      result.current.handleInputChange("eagles");
    });

    expect(result.current.clearDisabled).toBe(false);

    act(() => {
      result.current.handleInputChange("");
    });

    expect(result.current.clearDisabled).toBe(true);
  });

  it('clears everything when the search is cleared', () => {
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));

    act(() => {
      result.current.handleSearchSubmit("eagles");
    });

    act(() => {
      result.current.handleClearSearch();
    });

    expect(result.current.input).toBe("");
    expect(result.current.submittedQuery).toBe("");
    expect(result.current.hasSearched).toBe(false);
  });

  it("starts an opened artist's songs unfiltered, then narrows them as the box is typed in", () => {
    const { result } = renderHook(() => useSearchTabLogic(defaultProps));

    act(() => {
      result.current.handleSearchSubmit("eagles");
    });
    act(() => {
      result.current.handleArtistSelect({ path: "the-eagles", displayName: "Eagles", songCount: null });
    });

    // The box is holding the artist's name here. Matching song titles against it
    // would hide every song not named after the act, which is what made an
    // artist with 98 songs come up empty.
    expect(result.current.artistFilter).toBe("");

    act(() => {
      result.current.handleInputChange("desperado");
    });

    expect(result.current.artistFilter).toBe("desperado");
  });

  it('should handle session storage errors gracefully', () => {
    mockSessionStorage.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useSearchTabLogic(defaultProps));

    expect(() => {
      act(() => {
        result.current.handleSearchSubmit("eagles hotel california");
      });
    }).not.toThrow();

    // Should still update local state even if session storage fails
    expect(result.current.submittedQuery).toBe("eagles hotel california");
  });
});
