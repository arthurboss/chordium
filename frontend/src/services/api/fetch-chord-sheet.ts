import type { ChordSheet } from "@chordium/types";

/**
 * Fetches a complete chord sheet from the backend API using progressive loading
 * 
 * @param path - The chord sheet path (e.g., "radiohead/creep")
 * @returns Promise resolving to chord sheet data or null if not found
 */
export async function fetchChordSheetFromAPI(path: string): Promise<ChordSheet | null> {
  try {
    // Use progressive loading: fetch metadata first, then content
    const [metadataResponse, contentResponse] = await Promise.all([
      fetch(`/api/cifraclub-song-metadata?url=${encodeURIComponent(path.trim())}`),
      fetch(`/api/cifraclub-chord-sheet?url=${encodeURIComponent(path.trim())}`)
    ]);
    
    if (!metadataResponse.ok || !contentResponse.ok) {
      if (metadataResponse.status === 404 || contentResponse.status === 404) {
        return null; // Chord sheet not found
      }
      throw new Error(`API request failed: ${metadataResponse.status} ${contentResponse.status}`);
    }

    const [metadata, content] = await Promise.all([
      metadataResponse.json(),
      contentResponse.json()
    ]);
    
    // Validate the responses
    if (!metadata || typeof metadata !== 'object' || !content || typeof content !== 'object') {
      throw new Error('Invalid API response format');
    }

    // Combine metadata and content into a complete ChordSheet
    const chordSheet: ChordSheet = {
      ...metadata,
      ...content
    };

    return chordSheet;
    
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching chord sheet from API:', error);
    }
    throw error;
  }
}
