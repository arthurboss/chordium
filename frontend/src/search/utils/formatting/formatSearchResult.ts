/**
 * Formats search result items for consistent display.
 * 
 * Extracts cleaner titles by removing artist information when present,
 * typically from titles formatted as "Title - Artist".
 * 
 * @param item - The song object to format
 * @returns The formatted song object with cleaned title
 */
import type { Song } from "@chordium/types";

export function formatSearchResult(item: Song): Song {
  // Extract cleaner title if it contains " - " (remove artist part)
  const title = item.title.includes(" - ") 
    ? item.title.split(" - ")[0].trim()
    : item.title;

  return {
    title,
    path: item.path,
    artist: item.artist,
  };
}
