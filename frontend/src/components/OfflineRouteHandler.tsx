import { useLocation } from 'react-router-dom';
import { useOffline } from '@/hooks/use-offline';
import { useChordSheets } from '@/storage/hooks';
import { validateRoute } from '@/utils/route-validation';
import OfflineFallback from '@/pages/OfflineFallback';
import RedirectToHome from './RedirectToHome';
import NotFound from '@/pages/NotFound';

interface OfflineRouteHandlerProps {
  children: React.ReactNode;
}

/**
 * Smart offline route handler that:
 * 1. Checks if user is offline
 * 2. Validates if the requested route is available offline
 * 3. Shows appropriate fallback UI only for unavailable routes
 */
const OfflineRouteHandler = ({ children }: OfflineRouteHandlerProps) => {
  const location = useLocation();
  const { isOffline } = useOffline();
  
  const { myChordSheets } = useChordSheets();
  
  // Debug logging
  console.log('OfflineRouteHandler:', {
    pathname: location.pathname,
    isOffline,
    myChordSheetsCount: myChordSheets?.length || 0
  });
  
  // If online, render children normally
  if (!isOffline) {
    return <>{children}</>;
  }

  // User is offline - check route availability
  const validation = validateRoute(location.pathname);
  
  // For clearly invalid URLs, redirect to home even when offline
  if (validation.shouldRedirectHome) {
    return <RedirectToHome reason={`Invalid URL pattern: ${location.pathname}`} />;
  }

  // Only handle chord sheet routes (/:artist/:song)
  // All other routes are handled by the Home component and don't need offline validation
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length >= 2) {
    // This is a chord sheet route: /artist/song
    const artistSlug = pathSegments[0];
    const songSlug = pathSegments[1];
    const requestedPath = `${artistSlug}/${songSlug}`;
    
    // Check if this specific chord sheet is saved offline
    const isAvailableOffline = myChordSheets?.some(sheet => 
      sheet.path === requestedPath
    );

    if (isAvailableOffline) {
      // Chord sheet is available offline - render normally
      return <>{children}</>;
    } else {
      // Chord sheet not available offline - show offline fallback
      return <OfflineFallback requestedPath={requestedPath} />;
    }
  }

  // For any other route (including single segment routes), render normally
  // These are handled by the Home component and don't need offline validation
  return <>{children}</>;
};

export default OfflineRouteHandler;


