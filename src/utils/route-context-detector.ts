/**
 * Route context types for the application
 */
export type RouteContext = 'my-songs' | 'search';

/**
 * Determines if the current route is within the My Songs context
 * Follows SRP: Single responsibility of route detection
 * 
 * @returns boolean - True if current route is My Songs context
 */
export function isMySONgsRoute(): boolean {
  const currentPath = window.location.pathname;
  return currentPath.startsWith('/my-songs');
}

/**
 * Gets the current route context (My Songs or Search)
 * Follows SRP: Single responsibility of context determination
 * 
 * @returns RouteContext - The current route context
 */
export function getRouteContext(): RouteContext {
  return isMySONgsRoute() ? 'my-songs' : 'search';
}
