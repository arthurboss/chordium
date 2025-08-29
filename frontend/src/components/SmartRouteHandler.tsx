import { useLocation, useParams } from 'react-router-dom';
import { validateRoute } from '@/utils/route-validation';
import RedirectToHome from './RedirectToHome';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/Home';

/**
 * Smart route handler that decides whether to redirect invalid URLs, 
 * show helpful error pages for potentially valid routes, or render the Home component
 */
const SmartRouteHandler = () => {
  const location = useLocation();
  const params = useParams();
  const validation = validateRoute(location.pathname);

  // For clearly invalid URLs, show redirect message then redirect
  if (validation.shouldRedirectHome) {
    return <RedirectToHome reason={`Invalid URL pattern: ${location.pathname}`} />;
  }

  // If this is a valid artist route (/:artist), render the Home component
  if (params.artist && validation.routeType === 'artist') {
    return <Home />;
  }

  // For potentially valid music routes, show helpful error page
  return <NotFound />;
};

export default SmartRouteHandler;
