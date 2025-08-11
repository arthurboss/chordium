// Storage key for navigation path
const NAVIGATION_PATH_KEY = "chordium_navigation_path";

/**
 * Stores the navigation path for back button functionality
 * 
 * @param path - The path to store (e.g., "/search?artist=hillsong-united", "/my-chord-sheets")
 */
export function storeNavigationPath(path: string): void {
  try {
    sessionStorage.setItem(NAVIGATION_PATH_KEY, path);
  } catch (error) {
    console.warn("Failed to store navigation path:", error);
  }
}

/**
 * Retrieves the stored navigation path
 * 
 * @returns The stored navigation path or null if not found
 */
export function getNavigationPath(): string | null {
  try {
    return sessionStorage.getItem(NAVIGATION_PATH_KEY);
  } catch (error) {
    console.warn("Failed to retrieve navigation path:", error);
    return null;
  }
}

/**
 * Clears the stored navigation path
 */
export function clearNavigationPath(): void {
  try {
    sessionStorage.removeItem(NAVIGATION_PATH_KEY);
  } catch (error) {
    console.warn("Failed to clear navigation path:", error);
  }
}

/**
 * Determines if a path represents a "my-chord-sheets" source
 * 
 * @param path - The path to check
 * @returns True if the path is from my-chord-sheets
 */
export function isMyChordSheetsPath(path: string): boolean {
  return path === '/my-chord-sheets';
}

/**
 * Determines if a path represents a search source
 * 
 * @param path - The path to check
 * @returns True if the path is from search
 */
export function isSearchPath(path: string): boolean {
  return path.startsWith('/search');
}
