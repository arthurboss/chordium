/**
 * Formats artist result items for consistent display
 * Single responsibility: Artist result data formatting
 */
import { Artist } from "@chordium/types";

export function formatArtistResult(item: Artist): Artist {
  let displayName = item.displayName || "Unknown Artist";
  
  // If the path contains segments that can be used to extract a better artist name
  try {
    // Construct a URL-like string from the path for parsing
    const urlString = `https://example.com/${item.path}`;
    const url = new URL(urlString);
    const path = url.pathname.replace(/(^\/|\/)$/g, '');
    
    // If it's a direct artist path without song part
    if (!path.includes('/')) {
      displayName = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  } catch (e) {
    console.error("Error parsing path:", e);
  }

  return {
    path: item.path,
    displayName: displayName,
    songCount: item.songCount
  };
}
