import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { validateRoute } from "@/utils/route-validation";
import RedirectToHome from "@/components/RedirectToHome";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const validation = validateRoute(location.pathname);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Validation result:",
      validation
    );
  }, [location.pathname, validation]);

  // If it's clearly an invalid URL (admin, api, etc.), redirect to home immediately
  if (validation.shouldRedirectHome) {
    return <RedirectToHome reason={`Invalid URL pattern: ${location.pathname}`} />;
  }

  // For everything else, show a simple not found page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <AlertTriangle className="mx-auto h-16 w-16 text-orange-400" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-lg text-gray-600 mb-4">
            The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500 mb-6">
            Check the URL for typos, or return to the home page to start your music search.
          </p>
        </div>
        
        <Button asChild className="flex items-center gap-2">
          <a href="/">
            <Home className="h-4 w-4" />
            Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
