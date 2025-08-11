import { useEffect } from "react";
import { storeOriginalSearchUrl } from "@/utils/chordium-navigation";

export function usePreserveSearchUrlEffect(location: { pathname: string; search: string }) {
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const isBasicAppTab = location.pathname === '/my-chord-sheets' ||
      location.pathname === '/upload' ||
      (location.pathname === '/search' && !location.search);
    if (!isBasicAppTab) {
      storeOriginalSearchUrl(currentPath);
    }
  }, [location.pathname, location.search]);
}
