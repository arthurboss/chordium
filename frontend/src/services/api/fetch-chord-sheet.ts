import type { ChordSheet } from "@chordium/types";

/**
 * Fetches a complete chord sheet from the backend API (for storage purposes)
 * This fetches both metadata and content simultaneously
 * 
 * @param path - The chord sheet path (e.g., "radiohead/creep")
 * @returns Promise resolving to chord sheet data or null if not found
 */
export async function fetchChordSheetFromAPI(path: string): Promise<ChordSheet | null> {
  try {
    // For storage purposes, fetch both metadata and content simultaneously
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

/**
 * Fetches only metadata from the backend API (for progressive loading)
 * This is used for initial UI display without blocking on content
 * 
 * @param path - The chord sheet path (e.g., "radiohead/creep")
 * @returns Promise resolving to metadata or null if not found
 */
export async function fetchChordSheetMetadataFromAPI(path: string): Promise<Partial<ChordSheet> | null> {
  try {
    const response = await fetch(`/api/cifraclub-song-metadata?url=${encodeURIComponent(path.trim())}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Chord sheet not found
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const metadata = await response.json();
    
    // Validate the response
    if (!metadata || typeof metadata !== 'object') {
      throw new Error('Invalid API response format');
    }

    return metadata;
    
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching chord sheet metadata from API:', error);
    }
    throw error;
  }
}
