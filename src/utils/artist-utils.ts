// Utility functions for artist-related logic
import { Song } from "@/types/song";

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

  // TODO: Replace with IndexedDB cache implementation
  // const cachedSongs = getCachedArtistSongs(artistPath);
  const cachedSongs = null; // TODO: Implement IndexedDB cache lookup
  if (cachedSongs) {
    console.log(`🎯 CACHE HIT: Using cached songs for artist: ${artistPath} (${cachedSongs.length} songs)`);
    return cachedSongs;
  }

  console.log(`🌐 CACHE MISS: Fetching songs for artist path: ${artistPath}`);
  const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/artist-songs?artistPath=${encodeURIComponent(artistPath)}`;
  console.log(`API URL: ${apiUrl}`);
  
  try {
    const resp = await fetch(apiUrl);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`API error (${resp.status}): ${errorText}`);
      throw new Error(`${resp.statusText} (${resp.status}): ${errorText}`);
    }
    
    const data: Song[] = await resp.json();
    console.log(`Received ${data.length} songs for artist ${artistPath}`);
    
    // TODO: Replace with IndexedDB cache implementation
    // console.log(`💾 CACHING: Saving ${data.length} songs for artist: ${artistPath}`);
    // cacheArtistSongs(artistPath, data);
    console.log(`💾 CACHING: Caching disabled - needs IndexedDB replacement`);
    
    // Return the data as-is (Song objects with title and path)
    return data;
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    throw error;
  }
}
