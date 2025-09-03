import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useInitSearchStateEffect } from "../useInitSearchStateEffect";

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
    setArtistInput: vi.fn(),
    setSongInput: vi.fn(),
    setPrevArtistInput: vi.fn(),
    setPrevSongInput: vi.fn(),
    setSubmittedArtist: vi.fn(),
    setSubmittedSong: vi.fn(),
    setOriginalSearchArtist: vi.fn(),
    setOriginalSearchSong: vi.fn(),
    updateSearchStateWithOriginal: vi.fn(),
    setHasSearched: vi.fn(),
    setShouldFetch: vi.fn(),
    setActiveArtist: vi.fn(),
    isOnArtistPage: vi.fn(() => false),
    getCurrentArtistPath: vi.fn(() => null),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  it('should initialize with default values when no session storage data exists', () => {
    renderHook(() => useInitSearchStateEffect(mockOptions));
    
    // Should not call any setters when no session storage data exists
    expect(mockOptions.setArtistInput).not.toHaveBeenCalled();
    expect(mockOptions.setSongInput).not.toHaveBeenCalled();
    expect(mockOptions.setHasSearched).not.toHaveBeenCalled();
  });

  it('should not reinitialize when already initialized', () => {
    const mockOptionsInitialized = {
      ...mockOptions,
      isInitialized: { current: true },
    };
    
    renderHook(() => useInitSearchStateEffect(mockOptionsInitialized));
    
    // Should not call any setters when already initialized
    expect(mockOptionsInitialized.setArtistInput).not.toHaveBeenCalled();
    expect(mockOptionsInitialized.setSongInput).not.toHaveBeenCalled();
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

  it('should handle URL parameter initialization for search route', () => {
    const mockOptionsWithSearchParams = {
      ...mockOptions,
      location: { 
        search: "?artist=URL%20Artist&song=URL%20Song", 
        pathname: "/search" 
      },
    };
    
    renderHook(() => useInitSearchStateEffect(mockOptionsWithSearchParams));
    
    // Should initialize from URL parameters
    expect(mockOptionsWithSearchParams.setArtistInput).toHaveBeenCalledWith("URL Artist");
    expect(mockOptionsWithSearchParams.setSongInput).toHaveBeenCalledWith("URL Song");
    expect(mockOptionsWithSearchParams.setSubmittedArtist).toHaveBeenCalledWith("URL Artist");
    expect(mockOptionsWithSearchParams.setSubmittedSong).toHaveBeenCalledWith("URL Song");
    expect(mockOptionsWithSearchParams.setOriginalSearchArtist).toHaveBeenCalledWith("URL Artist");
    expect(mockOptionsWithSearchParams.setOriginalSearchSong).toHaveBeenCalledWith("URL Song");
    expect(mockOptionsWithSearchParams.setHasSearched).toHaveBeenCalledWith(true);
    expect(mockOptionsWithSearchParams.setShouldFetch).toHaveBeenCalledWith(true);
  });
});
