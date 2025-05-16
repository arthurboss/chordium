import { useEffect } from "react";

// Redirects to /search without query parameters if the user lands directly on /search with any query string.
export function useSearchRedirect() {
  useEffect(() => {
    if (window.location.pathname === "/search" && window.location.search) {
      window.location.replace("/search");
    }
  }, []);
}
