import { useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Artist } from '@/types/artist';
import { ArtistUrlNavigation } from '@/utils/artist-url-navigation';

/**
 * Hook to manage artist navigation state and logic
 * 
 * Follows DRY: Centralizes artist navigation logic
 * Follows SRP: Single responsibility for artist navigation
 */
export const useArtistNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store original search parameters when navigating to artist
  const originalSearchParams = useRef<{ artist?: string; song?: string }>({});

  /**
   * Navigate to artist page when artist is selected
   */
  const navigateToArtist = useCallback((artist: Artist) => {
    // Store current search parameters for back navigation
    const searchParams = new URLSearchParams(location.search);
    originalSearchParams.current = {
      artist: searchParams.get('artist') || undefined,
      song: searchParams.get('song') || undefined,
    };
    
    ArtistUrlNavigation.navigateToArtist(artist, navigate);
  }, [navigate, location.search]);

  /**
   * Navigate back to search results
   */
  const navigateBackToSearch = useCallback(() => {
    ArtistUrlNavigation.navigateBackToSearch(originalSearchParams.current, navigate);
  }, [navigate]);

  /**
   * Check if currently on an artist page
   */
  const isOnArtistPage = useCallback(() => {
    return ArtistUrlNavigation.isArtistPage(location.pathname);
  }, [location.pathname]);

  /**
   * Get current artist path from URL
   */
  const getCurrentArtistPath = useCallback(() => {
    return ArtistUrlNavigation.extractArtistFromUrl(location.pathname);
  }, [location.pathname]);

  return {
    navigateToArtist,
    navigateBackToSearch,
    isOnArtistPage,
    getCurrentArtistPath,
    originalSearchParams: originalSearchParams.current,
  };
}; 