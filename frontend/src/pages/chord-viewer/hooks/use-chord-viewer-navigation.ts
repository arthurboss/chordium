import { useNavigate } from "react-router-dom";
import type { ChordViewerNavigationMethods } from "../chord-viewer.types";

/**
 * Hook for chord viewer navigation logic
 * Provides navigation methods for different chord sheet sources
 * 
 * @returns Navigation methods
 */
export function useChordViewerNavigation(): ChordViewerNavigationMethods {
  const navigate = useNavigate();
  
  const navigateToMyChordSheets = () => {
    navigate('/my-chord-sheets');
  };
  
  const navigateToHome = () => {
    navigate('/');
  };
  
  return {
    navigateToMyChordSheets,
    navigateToHome
  };
}
