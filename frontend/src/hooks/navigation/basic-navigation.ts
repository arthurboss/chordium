import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { BasicNavigationMethods } from "./navigation.types";

/**
 * Provides basic navigation methods for core application navigation
 * 
 * @returns Basic navigation methods
 */
export function useBasicNavigation(): BasicNavigationMethods {
  const navigate = useNavigate();
  const params = useParams();

  const navigateToMyChordSheets = useCallback(() => {
    navigate('/my-chord-sheets');
  }, [navigate]);
  
  const navigateToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const navigateToSearch = useCallback(() => {
    // If we're on an artist page, navigate to search with that artist
    const { artist } = params;
    
    if (artist) {
      // Navigate to artist search page - this will trigger loading cached results
      navigate(`/search?artist=${artist}`);
      return;
    }

    // Fallback to general search page
    navigate('/search');
  }, [navigate, params]);

  const navigateBack = useCallback(() => {
    // Let browser history handle back navigation naturally
    // This is more reliable than manual path storage
    navigate(-1);
  }, [navigate]);

  return {
    navigateToMyChordSheets,
    navigateToHome,
    navigateToSearch,
    navigateBack,
  };
}
