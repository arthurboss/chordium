// Utility functions for artist-related logic
import { Song } from "@/types/song";
import { cacheArtistSongs, getCachedArtistSongs } from "@/cache/implementations/artist-cache";
import { getApiBaseUrl } from './api-base-url';

export function extractArtistSlug(artistUrl: string): string | null {
  try {
    const url = new URL(artistUrl);
    const slug = url.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
    return slug || null;
  } catch {
    return null;
  }
}

export async function fetchArtistSongs(artistPath: string): Promise<Song[]> {
  if (!artistPath) {
    console.error('Invalid artist path: empty string');
    throw new Error('Invalid artist path');
  }

  // Try to get cached results first
  const cachedSongs = getCachedArtistSongs(artistPath);
  if (cachedSongs) {
    return cachedSongs;
  }

  const apiUrl = `${getApiBaseUrl()}/api/artist-songs?artistPath=${encodeURIComponent(artistPath)}`;
  
  try {
    const resp = await fetch(apiUrl);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`API error (${resp.status}): ${errorText}`);
      throw new Error(`${resp.statusText} (${resp.status}): ${errorText}`);
    }
    
    const data: Song[] = await resp.json();
    
    // Cache the results for future use
    cacheArtistSongs(artistPath, data);
    
    // Return the data as-is (Song objects with title and path)
    return data;
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    throw error;
  }
}
