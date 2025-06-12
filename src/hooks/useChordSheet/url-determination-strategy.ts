import { getChordUrl } from "../../utils/session-storage-utils";

/**
 * URL determination strategy for chord sheet fetching
 * Specific to useChordSheet hook - handles URL priority logic
 * Follows SRP: Single responsibility of URL determination
 */
export class URLDeterminationStrategy {
  /**
   * Determines the fetch URL based on priority:
   * 1. Explicit URL parameter
   * 2. Stored URL from session storage
   * 3. Reconstructed URL from artist/song params
   * 
   * @param url - Explicit URL parameter
   * @param artist - Artist parameter
   * @param song - Song parameter
   * @returns Promise<{url: string | null, isReconstructed: boolean}>
   */
  async determineFetchUrl(
    url?: string, 
    artist?: string, 
    song?: string
  ): Promise<{ url: string | null; isReconstructed: boolean }> {
    // Priority 1: Explicit URL
    if (url) {
      return { url, isReconstructed: false };
    }
    
    // Priority 2: Must have artist and song params
    if (!artist || !song) {
      return { url: null, isReconstructed: false };
    }

    // Priority 3: Try session storage
    const storedUrl = getChordUrl(artist, song);
    if (storedUrl) {
      console.log("Found URL in session storage:", storedUrl);
      return { url: storedUrl, isReconstructed: false };
    }

    // Priority 4: Reconstruct from params
    const artistSlug = artist.toLowerCase();
    const songSlug = song.toLowerCase();
    const reconstructedUrl = `https://www.cifraclub.com.br/${artistSlug}/${songSlug}/`;
    console.log("Reconstructed URL from params:", reconstructedUrl);
    
    return { url: reconstructedUrl, isReconstructed: true };
  }
}
