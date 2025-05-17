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

export async function fetchArtistSongs(artistUrl: string): Promise<SongData[]> {
  const slug = extractArtistSlug(artistUrl);
  if (!slug) return [];
  const resp = await fetch(`http://localhost:3001/api/cifraclub-artist-songs?artistUrl=${encodeURIComponent(artistUrl)}`);
  if (!resp.ok) throw new Error(resp.statusText);
  const data: { title: string; url: string }[] = await resp.json();
  return data.map(item => ({ id: item.url, title: item.title, artist: slug, path: item.url }));
}
