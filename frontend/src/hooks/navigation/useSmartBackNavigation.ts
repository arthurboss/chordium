import { useNavigate, useLocation } from "react-router-dom";

/**
 * Custom hook for smart back navigation that handles cases where users
 * land directly on a page without navigation history.
 * 
 * @returns Smart back navigation function
 */
export const useSmartBackNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSmartBack = () => {
    // Check if we have navigation state (user came from within the app)
    // The app sets location.state.song when navigating from search results
    const hasNavigationState = location.state && location.state.song;

    // Simple approach: Only use browser back if we have navigation state
    // This is the most reliable indicator that user navigated within the app
    if (hasNavigationState) {
      navigate(-1);
      return;
    } else {
      // No navigation state means user landed directly on URL or came from external source
      // Navigate to search page instead
      navigate('/search');
      return;
    }
  };

  return handleSmartBack;
};
