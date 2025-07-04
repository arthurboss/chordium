import { ChordSheet } from '@/types/chordSheet';
import { convertResponseToChordSheet } from '../utils/convert-response-to-chord-sheet';

/**
 * Fetch chord sheet from backend API
 * 
 * @param fetchPath - Path to fetch the chord sheet from (e.g., "artist/song")
 * @param artist - Artist name for logging
 * @param title - Song title for logging
 * @returns Promise with chord sheet data or null if failed
 */
export async function fetchChordSheetFromBackend(
  fetchPath: string,
  artist: string,
  title: string
): Promise<ChordSheet | null> {
  try {
    console.log('🌐 FRONTEND FETCH START: Fetching chord sheet from backend');
    console.log('📊 Flow Step 4: Frontend making API call to backend');
    console.log('📋 Request details:', { fetchPath, timestamp: new Date().toISOString() });
    
    // Build API URL with path parameter (backend handles URL construction)
    const apiUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/cifraclub-chord-sheet?path=${encodeURIComponent(fetchPath)}`;
    
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

    // Convert to ChordSheet format
    const chordSheet = convertResponseToChordSheet(backendResponse);
    
    console.log('💾 Flow Step 7: Preparing to cache chord sheet data');
    console.log('🔑 Cache details:', {
      artist,
      title,
      hasChords: !!chordSheet.songChords,
      chordsLength: chordSheet.songChords.length
    });
    
    return chordSheet;
    
  } catch (error) {
    console.error('❌ Error fetching chord sheet:', error);
    return null;
  }
}
