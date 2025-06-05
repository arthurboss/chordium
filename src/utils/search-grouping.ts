// Utility to group songs by artist name
import { SearchResultItem } from "@/utils/search-result-item";
import { formatSearchResult } from "@/utils/search-results-utils";

export interface GroupedSongs {
  artist: string;
  songs: SearchResultItem[];
}

/**
 * Extract artist name from a URL path
 * Expected format: https://domain.com/artist-name/ for artists
 * Expected format: https://domain.com/artist-name/song-name/ for songs
 */
export function extractArtistFromUrl(url: string, type: 'artist' | 'song'): string {
  try {
    if (!url) return "Unknown Artist";
    // Remove protocol and domain
    const urlWithoutProtocol = url.replace(/^(https?:\/\/)?(www\.)?[^/]+\//, '');
    // Split by '/' and filter out empty segments
    const segments = urlWithoutProtocol.split('/').filter(Boolean);
    if (type === 'artist' && segments.length > 0) {
      return formatReadableName(segments[0]);
    }
    if (type === 'song' && segments.length > 1) {
      return formatReadableName(segments[0]);
    }
    return "Unknown Artist";
  } catch (error) {
    console.error("Error extracting artist from URL:", error);
    return "Unknown Artist";
  }
}

/**
 * Format a URL-friendly name into a readable format
 * Example: "john-doe" -> "John Doe"
 */
export function formatReadableName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function groupSongsByArtist(songs: SearchResultItem[]): GroupedSongs[] {
  const groups: Record<string, SearchResultItem[]> = {};
  
  songs.forEach((item) => {
    const songData = formatSearchResult(item);
    // Always extract artist from song URL (second segment after domain)
    let artist = item.url ? extractArtistFromUrl(item.url, 'song') : 'Unknown Artist';
    artist = artist || "Unknown Artist";
    if (!groups[artist]) groups[artist] = [];
    groups[artist].push(item);
  });
  
  return Object.entries(groups).map(([artist, songs]) => ({ artist, songs }));
}
