// Consolidated storage key for navigation context
const CHORDIUM_NAVIGATION_KEY = "chordium_navigation_context";

/**
 * Navigation context interface for consolidated storage
 */
export interface ChordiumNavigationContext {
  source: 'search' | 'my-chord-sheets';
  originalUrl?: string;
}

/**
 * storeOriginalSearchUrl
 *
 * Stores the original search URL format in sessionStorage to preserve it during navigation.
 * Now part of the consolidated navigation context.
 *
 * @param url - The original search URL to store
 */
export function storeOriginalSearchUrl(url: string) {
  try {
    const existing = getChordiumNavigationContext();
    const navigationContext: ChordiumNavigationContext = {
      source: existing?.source || 'search',
      originalUrl: url
    };
    sessionStorage.setItem(CHORDIUM_NAVIGATION_KEY, JSON.stringify(navigationContext));
  } catch (error) {
    console.warn("Failed to store original search URL:", error);
  }
}

/**
 * getOriginalSearchUrl
 *
 * Retrieves the original search URL from sessionStorage.
 *
 * @returns The stored search URL or null if not found
 */
export function getOriginalSearchUrl(): string | null {
  try {
    const context = getChordiumNavigationContext();
    return context?.originalUrl || null;
  } catch (error) {
    console.warn("Failed to retrieve original search URL:", error);
    return null;
  }
}

/**
 * storeNavigationSource
 *
 * Stores the source of navigation (search or my-chord-sheets) in sessionStorage.
 * Now part of the consolidated navigation context.
 *
 * @param source - The navigation source ('search' or 'my-chord-sheets')
 */
export function storeNavigationSource(source: 'search' | 'my-chord-sheets') {
  try {
    const existing = getChordiumNavigationContext();
    const navigationContext: ChordiumNavigationContext = {
      source,
      originalUrl: existing?.originalUrl
    };
    sessionStorage.setItem(CHORDIUM_NAVIGATION_KEY, JSON.stringify(navigationContext));
  } catch (error) {
    console.warn("Failed to store navigation source:", error);
  }
}

/**
 * getNavigationSource
 *
 * Retrieves the navigation source from sessionStorage.
 *
 * @returns The stored navigation source or null if not found
 */
export function getNavigationSource(): 'search' | 'my-chord-sheets' | null {
  try {
    const context = getChordiumNavigationContext();
    return context?.source || null;
  } catch (error) {
    console.warn("Failed to retrieve navigation source:", error);
    return null;
  }
}

/**
 * getChordiumNavigationContext
 *
 * Retrieves the complete navigation context from sessionStorage.
 *
 * @returns The stored navigation context or null if not found
 */
export function getChordiumNavigationContext(): ChordiumNavigationContext | null {
  try {
    const stored = sessionStorage.getItem(CHORDIUM_NAVIGATION_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as ChordiumNavigationContext;
    if (parsed.source === 'search' || parsed.source === 'my-chord-sheets') {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn("Failed to retrieve chordium navigation context:", error);
    return null;
  }
}
