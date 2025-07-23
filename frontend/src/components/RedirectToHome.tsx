import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface RedirectToHomeProps {
  reason?: string;
}

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

const RedirectToHome = ({ reason }: RedirectToHomeProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Log for developers
    console.warn(
      '🚫 Invalid URL detected - redirecting to home:',
      {
        path: location.pathname,
        reason: reason || 'Invalid URL pattern',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }
    );

    // Analytics tracking (if you have analytics)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'invalid_url_redirect', {
        event_category: 'navigation',
        event_label: location.pathname,
        custom_reason: reason || 'Invalid URL pattern'
      });
    }

    // Short delay to show message, then redirect
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate, location.pathname, reason]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <h2 className="text-lg font-medium text-gray-900">Redirecting to Home...</h2>
        <p className="text-gray-600 max-w-md">
          The page you requested doesn't exist. Taking you back to the home page.
        </p>
      </div>
    </div>
  );
};

export default RedirectToHome;
