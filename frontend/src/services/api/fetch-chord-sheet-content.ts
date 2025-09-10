import type { ChordSheetContent } from "@chordium/types";

/**
 * Fetches chord sheet content from the backend API using the path
 * 
 * @param path - The chord sheet path (e.g., "radiohead/creep")
 * @returns Promise resolving to chord sheet content or null if not found
 */
export async function fetchChordSheetContentFromAPI(path: string): Promise<ChordSheetContent | null> {
  try {
    const params = new URLSearchParams({
      url: path.trim()
    });

    const response = await fetch(`/api/cifraclub-chord-sheet?${params}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Chord sheet content not found
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate the response has the expected content structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response format');
    }

    // The API should return a chord sheet content object that matches our ChordSheetContent type
    return data as ChordSheetContent;
    
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching chord sheet content from API:', error);
    }
    throw error;
  }
}
