import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearchState } from '@/context/SearchStateContext';
import { formatSearchUrl } from '@/utils/search-utils';

/**
 * Keeps the /search URL query params in sync with the current search state.
 * If the user navigates back to /search and the state has values but the URL does not,
 * this hook updates the URL to match the state.
 */
export function useSyncSearchUrlWithState() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchState } = useSearchState();
  const { artist, song } = searchState;

  useEffect(() => {
    if (!location.pathname.startsWith('/search')) return;

    const expectedUrl = formatSearchUrl(artist, song);
    const expected = expectedUrl.replace(/^\/search\??/, '');
    const current = location.search.replace(/^\?/, '');

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.debug('[useSyncSearchUrlWithState] Sync check', { artist, song, expected, current });
    }

    // If state has values but URL does not, always restore the query params
    if ((artist || song) && expected !== current) {
      const newUrl = expectedUrl;
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.debug('[useSyncSearchUrlWithState] Restoring URL to', newUrl);
      }
      try {
        navigate(newUrl, { replace: true });
      } catch (e) {
        window.history.replaceState({}, '', newUrl);
      }
      return;
    }
    // If state is empty and URL has params, clear them
    if (!artist && !song && current) {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.debug('[useSyncSearchUrlWithState] Clearing search params from URL');
      }
      try {
        navigate('/search', { replace: true });
      } catch (e) {
        window.history.replaceState({}, '', '/search');
      }
    }
  }, [location.pathname, location.search, artist, song, navigate]);
} 