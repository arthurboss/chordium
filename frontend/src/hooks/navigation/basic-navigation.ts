import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOriginalSearchUrl, getNavigationSource } from "@/utils/chordium-navigation";
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
    // First, try to get the stored original search URL
    const originalSearchUrl = getOriginalSearchUrl();
    
    if (originalSearchUrl) {
      navigate(originalSearchUrl);
      return;
    }

    // If no stored URL, try to construct search URL from current path
    // This handles the case where user came from search results
    const { artist } = params;
    
    if (artist) {
      // Navigate to artist search page - this will trigger loading cached results
      // Don't double-convert the slug - artist param is already a slug
      navigate(`/search?artist=${artist}`);
      return;
    }

    // Fallback to general search page
    navigate('/search');
  }, [navigate, params]);

  const navigateBack = useCallback(() => {
    const navigationSource = getNavigationSource();
    
    if (navigationSource === 'my-chord-sheets') {
      navigateToMyChordSheets();
    } else if (navigationSource === 'search') {
      navigateToSearch();
    } else {
      // Fallback: if no source is stored, determine based on context
      navigateToSearch();
    }
  }, [navigateToMyChordSheets, navigateToSearch]);

  return {
    navigateToMyChordSheets,
    navigateToHome,
    navigateToSearch,
    navigateBack,
  };
}
