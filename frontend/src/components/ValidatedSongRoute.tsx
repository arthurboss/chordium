import { useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { validateRoute } from '@/utils/route-validation';
import RedirectToHome from './RedirectToHome';
import ChordViewer from '@/pages/ChordViewer';

/**
 * Wrapper for song routes that validates if the artist/song names look legitimate
 */
const ValidatedSongRoute = () => {
  const { artist, song } = useParams();
  const location = useLocation();
  const validation = validateRoute(location.pathname);

  useEffect(() => {
    // Log all song route attempts for dev purposes
    console.log('🎵 Song route accessed:', {
      artist,
      song,
      path: location.pathname,
      validation,
      timestamp: new Date().toISOString()
    });
  }, [artist, song, location.pathname, validation]);

  // If route validation says this should redirect home, do it
  if (validation.shouldRedirectHome) {
    return <RedirectToHome reason={`Invalid song/artist pattern: ${artist}/${song}`} />;
  }

  // Otherwise, let the normal ChordViewer component handle it
  return <ChordViewer />;
};

export default ValidatedSongRoute;
