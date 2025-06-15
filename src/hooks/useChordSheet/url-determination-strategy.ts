import { getChordUrl } from "../../utils/session-storage-utils";
import { generateChordSheetId } from "../../utils/chord-sheet-id-generator";

/**
 * URL determination strategy for chord sheet fetching
 * Specific to useChordSheet hook - handles URL priority logic
 * Follows SRP: Single responsibility of URL determination
 */
export class URLDeterminationStrategy {
  /**
   * Determines the fetch URL based on priority:
   * 1. Explicit URL parameter
   * 2. Original song path (for accurate fetching from Cifra Club)
   * 3. Stored URL from session storage
   * 4. Reconstructed URL from artist/song params
   * 
   * @param url - Explicit URL parameter
   * @param artist - Artist parameter
   * @param song - Song parameter
   * @param originalPath - Original song path from navigation (e.g., "oficina-g3/espelhos-magicos-")
   * @returns Promise<{fetchUrl: string | null, storageKey: string | null, isReconstructed: boolean}>
   */
  async determineFetchUrl(
    url?: string, 
    artist?: string, 
    song?: string,
    originalPath?: string
  ): Promise<{ 
    fetchUrl: string | null; 
    storageKey: string | null; 
    isReconstructed: boolean 
  }> {
    // Priority 1: Explicit URL
    if (url) {
      // For explicit URLs, use the URL for both fetch and storage
      return { fetchUrl: url, storageKey: url, isReconstructed: false };
    }
    
    // Priority 2: Must have artist and song params for storage key
    if (!artist || !song) {
      return { fetchUrl: null, storageKey: null, isReconstructed: false };
    }

    // Create consistent storage key from formatted artist/song (always slugified)
    // Convert URL parameters back to proper names first
    const artistName = artist.replace(/-/g, ' ');
    const songName = song.replace(/-/g, ' ');
    const storageKey = generateChordSheetId(artistName, songName);

    // Priority 3: Use original path for fetching if available
    if (originalPath) {
      const fetchUrl = `https://www.cifraclub.com.br/${originalPath}/`;
      console.log("Using original path for fetch:", fetchUrl);
      console.log("Using formatted key for storage:", storageKey);
      return { fetchUrl, storageKey, isReconstructed: false };
    }

    // Priority 4: Try session storage
    const storedUrl = getChordUrl(artist, song);
    if (storedUrl) {
      console.log("Found URL in session storage:", storedUrl);
      return { fetchUrl: storedUrl, storageKey, isReconstructed: false };
    }

    // Priority 5: Reconstruct from params (fallback)
    const artistSlug = artist.toLowerCase();
    const songSlug = song.toLowerCase();
    const reconstructedUrl = `https://www.cifraclub.com.br/${artistSlug}/${songSlug}/`;
    console.log("Reconstructed URL from params:", reconstructedUrl);
    
    return { fetchUrl: reconstructedUrl, storageKey, isReconstructed: true };
  }
}
