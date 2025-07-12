import { ChordSheet } from '@/types/chordSheet';
import { convertResponseToChordSheet } from '../utils/convert-response-to-chord-sheet';

/**
 * Fetch chord sheet from backend API
 * 
 * @param fetchUrl - URL to fetch the chord sheet from
 * @param artist - Artist name for logging
 * @param title - Song title for logging
 * @returns Promise with chord sheet data or null if failed
 */
export async function fetchChordSheetFromBackend(
  fetchUrl: string,
  artist: string,
  title: string
): Promise<ChordSheet | null> {
  try {
    
    // Build API URL (backend now scrapes title and artist from the source page)
    const apiUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/cifraclub-chord-sheet?url=${encodeURIComponent(fetchUrl)}`;
    
    
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
    
    const backendResponse = await response.json();
    
    
    if (backendResponse.error) {
      throw new Error(`Backend error: ${backendResponse.error}`);
    }
    
    if (!backendResponse.songChords) {
      throw new Error('No chord sheet content found');
    }

    // Convert to ChordSheet format
    const chordSheet = convertResponseToChordSheet(backendResponse);
    
    
    return chordSheet;
    
  } catch (error) {
    console.error('❌ Error fetching chord sheet:', error);
    return null;
  }
}
