import type { SongMetadata } from "@chordium/types";

/**
 * Fetches song metadata from the backend API using the path
 * 
 * @param path - The chord sheet path (e.g., "radiohead/creep")
 * @returns Promise resolving to song metadata or null if not found
 */
export async function fetchSongMetadataFromAPI(path: string): Promise<SongMetadata | null> {
  try {
    const params = new URLSearchParams({
      url: path.trim()
    });

    const response = await fetch(`/api/cifraclub-song-metadata?${params}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Song metadata not found
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate the response has the expected metadata structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response format');
    }

    // The API should return a song metadata object that matches our SongMetadata type
    return data as SongMetadata;
    
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching song metadata from API:', error);
    }
    throw error;
  }
}
