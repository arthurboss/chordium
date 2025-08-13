import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNavigationPath } from "@/utils/navigation-path-storage";
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
    // First, try to get the stored navigation path
    const storedPath = getNavigationPath();
    
    if (storedPath && storedPath.startsWith('/search')) {
      navigate(storedPath);
      return;
    }

    // If no stored search path, try to construct search URL from current path
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
    const storedPath = getNavigationPath();
    
    if (storedPath) {
      // Navigate directly to the stored path
      navigate(storedPath);
    } else {
      // Fallback: if no path is stored, default to search
      navigateToSearch();
    }
  }, [navigate, navigateToSearch]);

  return {
    navigateToMyChordSheets,
    navigateToHome,
    navigateToSearch,
    navigateBack,
  };
}
