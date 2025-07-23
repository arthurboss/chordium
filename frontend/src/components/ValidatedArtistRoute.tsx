import { useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { validateRoute } from '@/utils/route-validation';
import RedirectToHome from './RedirectToHome';
import Home from '@/pages/Home';

/**
 * Wrapper for artist routes that validates if the artist name looks legitimate
 */
const ValidatedArtistRoute = () => {
  const { artist } = useParams();
  const location = useLocation();
  const validation = validateRoute(location.pathname);

  useEffect(() => {
    // Log all artist route attempts for dev purposes
    console.log('🎵 Artist route accessed:', {
      artist,
      path: location.pathname,
      validation,
      timestamp: new Date().toISOString()
    });
  }, [artist, location.pathname, validation]);

  // If route validation says this should redirect home, do it
  if (validation.shouldRedirectHome) {
    return <RedirectToHome reason={`Invalid artist name pattern: ${artist}`} />;
  }

  // Otherwise, let the normal Home component handle it (which will show artist not found)
  return <Home />;
};

export default ValidatedArtistRoute;
