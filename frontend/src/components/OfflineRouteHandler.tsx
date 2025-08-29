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

  // Define which routes work offline
  const offlineCompatibleRoutes = [
    '/',
    '/search',
    '/my-chord-sheets',
    '/upload'
  ];
  
  // Check if this is a known offline-compatible route
  if (offlineCompatibleRoutes.includes(location.pathname)) {
    return <>{children}</>;
  }

  // Check if this is a chord sheet route (artist/song pattern)
  const pathSegments = location.pathname.split('/').filter(Boolean);
  if (pathSegments.length >= 2) {
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

  // For any other route, show offline fallback
  return <OfflineFallback requestedPath={location.pathname} />;
};

export default OfflineRouteHandler;


