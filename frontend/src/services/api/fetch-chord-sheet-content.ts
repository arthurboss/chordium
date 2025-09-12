import type { ChordSheet } from "@chordium/types";
import { getApiBaseUrl } from "@/utils/api-base-url";

/**
 * Fetches chord sheet from the backend API using the path
 * 
 * @param path - The chord sheet path (e.g., "radiohead/creep")
 * @returns Promise resolving to chord sheet or null if not found
 */
export async function fetchChordSheetFromAPI(path: string): Promise<ChordSheet | null> {
  try {
    const params = new URLSearchParams({
      url: path.trim()
    });

    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/cifraclub-chord-sheet?${params}`);
    
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

    // The API should return a chord sheet object that matches our ChordSheet type
    return data as ChordSheet;
    
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching chord sheet content from API:', error);
    }
    throw error;
  }
}
