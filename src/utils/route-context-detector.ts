/**
 * Route context types for the application
 */
export type RouteContext = 'my-chord-sheets' | 'search';

/**
 * Determines if the current route is within the My Chord Sheets context
 * Follows SRP: Single responsibility of route detection
 * 
 * @returns boolean - True if current route is My Chord Sheets context
 */
export function isMyChordSheetsRoute(): boolean {
  const currentPath = window.location.pathname;
  return currentPath.startsWith('/my-chord-sheets');
}

/**
 * Gets the current route context (My Chord Sheets or Search)
 * Follows SRP: Single responsibility of context determination
 * 
 * @returns RouteContext - The current route context
 */
export function getRouteContext(): RouteContext {
  return isMyChordSheetsRoute() ? 'my-chord-sheets' : 'search';
}
