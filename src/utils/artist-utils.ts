// Utility functions for artist-related logic
import { ArtistSong } from "@/types/artistSong";
import { cacheArtistSongs, getCachedArtistSongs } from "./artist-cache-utils";

export function extractArtistSlug(artistUrl: string): string | null {
  try {
    const url = new URL(artistUrl);
    const slug = url.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
    return slug || null;
  } catch {
    return null;
  }
}

export async function fetchArtistSongs(artistPath: string): Promise<ArtistSong[]> {
  if (!artistPath) {
    console.error('Invalid artist path: empty string');
    throw new Error('Invalid artist path');
  }

  // Try to get cached results first
  const cachedSongs = getCachedArtistSongs(artistPath);
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
    
    const data: ArtistSong[] = await resp.json();
    console.log(`Received ${data.length} songs for artist ${artistPath}`);
    
    // Cache the results for future use
    console.log(`💾 CACHING: Saving ${data.length} songs for artist: ${artistPath}`);
    cacheArtistSongs(artistPath, data);
    
    // Return the data as-is (ArtistSong objects with title and path)
    return data;
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    throw error;
  }
}
