import { useLocation } from 'react-router-dom';
import { validateRoute } from '@/utils/route-validation';
import RedirectToHome from './RedirectToHome';
import NotFound from '@/pages/NotFound';

/**
 * Smart route handler that decides whether to redirect invalid URLs 
 * or show helpful error pages for potentially valid routes
 */
const SmartRouteHandler = () => {
  const location = useLocation();
  const validation = validateRoute(location.pathname);

  // For clearly invalid URLs, show redirect message then redirect
  if (validation.shouldRedirectHome) {
    return <RedirectToHome reason={`Invalid URL pattern: ${location.pathname}`} />;
  }

  // For potentially valid music routes, show helpful error page
  return <NotFound />;
};

export default SmartRouteHandler;
