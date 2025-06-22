import {
  clearExpiredChordSheetCache,
  getCachedChordSheet,
  cacheChordSheet
} from '../../cache/implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

/**
 * Convert response from backend to ChordSheet format
 * Backend now returns the new ChordSheet format directly
 */
function convertResponseToChordSheet(response: Record<string, unknown>): ChordSheet {
  return {
    title: response.title as string ?? '',
    artist: response.artist as string ?? 'Unknown Artist',
    songChords: response.songChords as string ?? '',
    songKey: response.songKey as string ?? '',
    guitarTuning: GUITAR_TUNINGS.STANDARD, // Backend always returns standard tuning for now
    guitarCapo: response.guitarCapo as number ?? 0
  };
}

/**
 * Cache coordination for useChordSheet hook
 * Hook-specific: handles cache operations and refresh logic
 * Follows SRP: Single responsibility of cache interaction
 */
export class CacheCoordinator {
  /**
   * Clears expired cache entries
   */
  clearExpiredCache(): void {
    clearExpiredChordSheetCache();
  }

  /**
   * Gets chord sheet data, checking cache first then fetching if needed
   * 
   * @param storageKey - Combined storage key (artist_name-song_title)
   * @param fetchUrl - URL to fetch from if not cached
   * @returns Promise with chord sheet data or null if failed
   */
  async getChordSheetData(
    storageKey: string,
    fetchUrl: string
  ): Promise<ChordSheet | null> {
    // Parse the storage key to get artist and title
    const { artist, title } = this.parseStorageKey(storageKey);
    
    // First check cache
    const cachedChordSheet = getCachedChordSheet(artist, title);
    
    if (cachedChordSheet) {
      console.log('Using cached chord sheet');
      return cachedChordSheet;
    }

    // Not cached, fetch from backend
    try {
      console.log('🌐 FRONTEND FETCH START: Fetching chord sheet from backend');
      console.log('📊 Flow Step 4: Frontend making API call to backend');
      console.log('📋 Request details:', { fetchUrl, timestamp: new Date().toISOString() });
      
      // Build API URL (backend now scrapes title and artist from the source page)
      const apiUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/cifraclub-chord-sheet?url=${encodeURIComponent(fetchUrl)}`;
      
      console.log('🔗 API URL:', apiUrl);
      
      // Use AbortController to implement timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chord sheet: ${response.statusText}`);
      }
      
      console.log('✅ Flow Step 5: Backend response received successfully');
      const backendResponse = await response.json();
      
      console.log('📦 Backend response structure:', {
        hasSongChords: !!backendResponse.songChords,
        hasError: !!backendResponse.error,
        hasGuitarCapo: !!backendResponse.guitarCapo,
        hasGuitarTuning: !!backendResponse.guitarTuning,
        hasSongKey: !!backendResponse.songKey,
        hasArtist: !!backendResponse.artist,
        hasTitle: !!backendResponse.title,
        chordsLength: backendResponse.songChords ? backendResponse.songChords.length : 0
      });
      
      if (backendResponse.error) {
        throw new Error(`Backend error: ${backendResponse.error}`);
      }
      
      if (!backendResponse.songChords) {
        throw new Error('No chord sheet content found');
      }

      // Convert to ChordSheet format and cache it
      const chordSheet = convertResponseToChordSheet(backendResponse);
      
      console.log('💾 Flow Step 7: Caching chord sheet data');
      console.log('🔑 Cache details:', {
        artist,
        title,
        hasChords: !!chordSheet.songChords,
        chordsLength: chordSheet.songChords.length
      });
      
      // Cache the chord sheet using the parsed artist and title
      cacheChordSheet(artist, title, chordSheet);
      
      console.log('✅ Flow Step 8: Chord sheet cached successfully');
      
      // Return the chord sheet directly
      return chordSheet;
      
    } catch (error) {
      console.error('❌ Error fetching chord sheet:', error);
      return null;
    }
  }

  /**
   * Parse storage key back to artist and title
   * @param storageKey - Combined storage key (artist_name-song_title)
   * @returns Object with artist and title
   */
  private parseStorageKey(storageKey: string): { artist: string; title: string } {
    // Split on the last dash to separate artist from title
    const lastDashIndex = storageKey.lastIndexOf('-');
    if (lastDashIndex === -1) {
      return { artist: storageKey, title: '' };
    }
    
    const artist = storageKey.substring(0, lastDashIndex).replace(/_/g, ' ');
    const title = storageKey.substring(lastDashIndex + 1).replace(/_/g, ' ');
    
    return { artist, title };
  }
}
