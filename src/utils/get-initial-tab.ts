// src/utils/get-initial-tab.ts

/**
 * Determines the initial tab based on the current pathname.
 * @param pathname The current location pathname
 * @returns The tab name to activate
 */
export function getInitialTab(pathname: string): string {
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/upload")) return "upload";
  return "my-chord-sheets"; // Default
}
