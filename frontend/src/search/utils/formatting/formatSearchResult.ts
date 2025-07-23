/**
 * Formats search result items for consistent display.
 * 
 * Extracts cleaner titles by removing artist information when present,
 * typically from titles formatted as "Title - Artist".
 * 
 * @param item - The song object to format
 * @returns The formatted song object with cleaned title
 */
import { Song } from "@chordium/types";

export function formatSearchResult(item: Song): Song {
  let title = item.title;

  // Extract cleaner title if it contains " - " (remove artist part)
  if (item.title.includes(" - ")) {
    const parts = item.title.split(" - ");
    title = parts[0].trim();
  }

  return {
    title: title,
    path: item.path,
    artist: item.artist,
  };
}
