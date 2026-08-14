import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useInitSearchStateEffect } from "../useInitSearchStateEffect";

vi.mock("@/search/utils/artist/artist-display-name-cache", () => ({
  getStoredArtistDisplayName: vi.fn().mockResolvedValue(null),
}));

import { getStoredArtistDisplayName } from "@/search/utils/artist/artist-display-name-cache";

const mockGetStoredArtistDisplayName = vi.mocked(getStoredArtistDisplayName);

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

describe("useInitSearchStateEffect", () => {
  const mockOptions = {
    location: { search: "", pathname: "/search" },
    isInitialized: { current: false },
    isClearing: false,
    setInput: vi.fn(),
    setSubmittedQuery: vi.fn(),
    setOriginalQuery: vi.fn(),
    setHasSearched: vi.fn(),
    setShouldFetch: vi.fn(),
    setActiveArtist: vi.fn(),
    isOnArtistPage: vi.fn(() => false),
    getCurrentArtistPath: vi.fn(() => null),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
    mockGetStoredArtistDisplayName.mockResolvedValue(null);
  });

  it('should initialize with default values when no session storage data exists', () => {
    renderHook(() => useInitSearchStateEffect(mockOptions));

    expect(mockOptions.setInput).not.toHaveBeenCalled();
    expect(mockOptions.setSubmittedQuery).not.toHaveBeenCalled();
    expect(mockOptions.setHasSearched).not.toHaveBeenCalled();
  });

  it('should not reinitialize when already initialized', () => {
    const mockOptionsInitialized = {
      ...mockOptions,
      isInitialized: { current: true },
    };

    renderHook(() => useInitSearchStateEffect(mockOptionsInitialized));

    expect(mockOptionsInitialized.setInput).not.toHaveBeenCalled();
    expect(mockOptionsInitialized.setSubmittedQuery).not.toHaveBeenCalled();
    expect(mockOptionsInitialized.setHasSearched).not.toHaveBeenCalled();
  });

  it('should handle session storage errors during artist page initialization', () => {
    const mockOptionsWithArtistPage = {
      ...mockOptions,
      location: { search: "", pathname: "/test-artist" },
      isOnArtistPage: vi.fn(() => true),
      getCurrentArtistPath: vi.fn(() => "test-artist"),
    };

    // Mock session storage to throw an error
    mockSessionStorage.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderHook(() => useInitSearchStateEffect(mockOptionsWithArtistPage));

    // Should log warning about storage error
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to restore search query from session storage:',
      expect.any(Error)
    );

    // Should still set active artist even if session storage fails
    expect(mockOptionsWithArtistPage.setActiveArtist).toHaveBeenCalledWith({
      displayName: "test artist",
      path: "test-artist",
      songCount: null,
    });

    consoleSpy.mockRestore();
  });

  it('should prefer the stored artist displayName over the slug-derived name', () => {
    const mockOptionsWithArtistPage = {
      ...mockOptions,
      location: { search: "", pathname: "/ac-dc" },
      isOnArtistPage: vi.fn(() => true),
      getCurrentArtistPath: vi.fn(() => "ac-dc"),
    };

    mockSessionStorage.getItem.mockImplementation((key: string) => {
      if (key === "chordium_artist_display_name") {
        return JSON.stringify({ path: "ac-dc", displayName: "AC/DC" });
      }
      return null;
    });

    renderHook(() => useInitSearchStateEffect(mockOptionsWithArtistPage));

    expect(mockOptionsWithArtistPage.setActiveArtist).toHaveBeenCalledWith({
      displayName: "AC/DC",
      path: "ac-dc",
      songCount: null,
    });
  });

  it('should not remove the stored displayName, so it survives repeated back-navigation', () => {
    const mockOptionsWithArtistPage = {
      ...mockOptions,
      location: { search: "", pathname: "/ac-dc" },
      isOnArtistPage: vi.fn(() => true),
      getCurrentArtistPath: vi.fn(() => "ac-dc"),
    };

    mockSessionStorage.getItem.mockImplementation((key: string) => {
      if (key === "chordium_artist_display_name") {
        return JSON.stringify({ path: "ac-dc", displayName: "AC/DC" });
      }
      return null;
    });

    renderHook(() => useInitSearchStateEffect(mockOptionsWithArtistPage));

    expect(mockSessionStorage.removeItem).not.toHaveBeenCalledWith("chordium_artist_display_name");
  });

  it('should ignore a stored displayName for a different artist path', () => {
    const mockOptionsWithArtistPage = {
      ...mockOptions,
      location: { search: "", pathname: "/oasis" },
      isOnArtistPage: vi.fn(() => true),
      getCurrentArtistPath: vi.fn(() => "oasis"),
    };

    mockSessionStorage.getItem.mockImplementation((key: string) => {
      if (key === "chordium_artist_display_name") {
        return JSON.stringify({ path: "ac-dc", displayName: "AC/DC" });
      }
      return null;
    });

    renderHook(() => useInitSearchStateEffect(mockOptionsWithArtistPage));

    expect(mockOptionsWithArtistPage.setActiveArtist).toHaveBeenCalledWith({
      displayName: "oasis",
      path: "oasis",
      songCount: null,
    });
  });

  it('should upgrade to the cached displayName once the async lookup resolves', async () => {
    const mockOptionsWithArtistPage = {
      ...mockOptions,
      location: { search: "", pathname: "/florianopolis-house-of-prayer" },
      isOnArtistPage: vi.fn(() => true),
      getCurrentArtistPath: vi.fn(() => "florianopolis-house-of-prayer"),
    };

    mockGetStoredArtistDisplayName.mockResolvedValue("Florianópolis House Of Prayer (fhop music)");

    renderHook(() => useInitSearchStateEffect(mockOptionsWithArtistPage));

    // Synchronous slug-derived guess is set first, so there's no blank flash.
    expect(mockOptionsWithArtistPage.setActiveArtist).toHaveBeenCalledWith({
      displayName: "florianopolis house of prayer",
      path: "florianopolis-house-of-prayer",
      songCount: null,
    });

    await waitFor(() => {
      expect(mockOptionsWithArtistPage.setActiveArtist).toHaveBeenCalledWith({
        displayName: "Florianópolis House Of Prayer (fhop music)",
        path: "florianopolis-house-of-prayer",
        songCount: null,
      });
    });
  });

  it('should not re-set activeArtist when the cached lookup matches what is already shown', async () => {
    const mockOptionsWithArtistPage = {
      ...mockOptions,
      location: { search: "", pathname: "/ac-dc" },
      isOnArtistPage: vi.fn(() => true),
      getCurrentArtistPath: vi.fn(() => "ac-dc"),
    };

    mockSessionStorage.getItem.mockImplementation((key: string) => {
      if (key === "chordium_artist_display_name") {
        return JSON.stringify({ path: "ac-dc", displayName: "AC/DC" });
      }
      return null;
    });
    mockGetStoredArtistDisplayName.mockResolvedValue("AC/DC");

    renderHook(() => useInitSearchStateEffect(mockOptionsWithArtistPage));

    await waitFor(() => {
      expect(mockGetStoredArtistDisplayName).toHaveBeenCalledWith("ac-dc");
    });

    expect(mockOptionsWithArtistPage.setActiveArtist).toHaveBeenCalledTimes(1);
  });

  it('should initialize the search from the q parameter', () => {
    const mockOptionsWithSearchParams = {
      ...mockOptions,
      location: { search: "?q=eagles%20hotel%20california", pathname: "/search" },
    };

    renderHook(() => useInitSearchStateEffect(mockOptionsWithSearchParams));

    expect(mockOptionsWithSearchParams.setInput).toHaveBeenCalledWith("eagles hotel california");
    expect(mockOptionsWithSearchParams.setSubmittedQuery).toHaveBeenCalledWith("eagles hotel california");
    expect(mockOptionsWithSearchParams.setOriginalQuery).toHaveBeenCalledWith("eagles hotel california");
    expect(mockOptionsWithSearchParams.setHasSearched).toHaveBeenCalledWith(true);
    expect(mockOptionsWithSearchParams.setShouldFetch).toHaveBeenCalledWith(true);
  });

  it('joins a link shared before search became one field into a single query', () => {
    const mockOptionsWithLegacyParams = {
      ...mockOptions,
      location: { search: "?artist=Eagles&song=Hotel%20California", pathname: "/search" },
    };

    renderHook(() => useInitSearchStateEffect(mockOptionsWithLegacyParams));

    expect(mockOptionsWithLegacyParams.setInput).toHaveBeenCalledWith("Eagles Hotel California");
    expect(mockOptionsWithLegacyParams.setSubmittedQuery).toHaveBeenCalledWith("Eagles Hotel California");
    expect(mockOptionsWithLegacyParams.setShouldFetch).toHaveBeenCalledWith(true);
  });

  it('does nothing while the search is being cleared', () => {
    const mockOptionsWhileClearing = {
      ...mockOptions,
      isClearing: true,
      location: { search: "?q=eagles", pathname: "/search" },
    };

    renderHook(() => useInitSearchStateEffect(mockOptionsWhileClearing));

    expect(mockOptionsWhileClearing.setInput).not.toHaveBeenCalled();
    expect(mockOptionsWhileClearing.setShouldFetch).not.toHaveBeenCalled();
  });
});
