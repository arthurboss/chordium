/**
 * Reads the search out of a set of URL parameters.
 *
 * Links shared before search became a single field carry separate `artist` and
 * `song` parameters. Joining them recovers the same phrase, since the source is
 * asked for one string either way, so an old bookmark still finds what it meant
 * instead of opening an empty page.
 *
 * @returns The search, or an empty string when the parameters describe no search.
 */
export function getSearchQuery(params: URLSearchParams): string {
  const query = params.get('q');
  if (query) return query.trim();

  return [params.get('artist'), params.get('song')].filter(Boolean).join(' ').trim();
}
