// Utility functions for artist-related logic
import { SongData } from "@/types/song";

export function extractArtistSlug(artistUrl: string): string | null {
  try {
    const url = new URL(artistUrl);
    const slug = url.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
    return slug || null;
  } catch {
    return null;
  }
}

export async function fetchArtistSongs(artistPath: string): Promise<SongData[]> {
  if (!artistPath) {
    console.error('Invalid artist path: empty string');
    throw new Error('Invalid artist path');
  }
  
  console.log(`Fetching songs for artist path: ${artistPath}`);
  const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/artist-songs?artistPath=${encodeURIComponent(artistPath)}`;
  console.log(`API URL: ${apiUrl}`);
  
  try {
    const resp = await fetch(apiUrl);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`API error (${resp.status}): ${errorText}`);
      throw new Error(`${resp.statusText} (${resp.status}): ${errorText}`);
    }
    
    const data: { title: string; path: string }[] = await resp.json();
    console.log(`Received ${data.length} songs for artist ${artistPath}`);
    
    // Format artist name from path (e.g., "hillsong-united" -> "Hillsong United")
    const formattedArtistName = artistPath
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return data.map(item => ({ 
      id: `${artistPath}-${item.path}`,
      title: item.title,
      artist: formattedArtistName,
      path: item.path 
    }));
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    throw error;
  }
}
