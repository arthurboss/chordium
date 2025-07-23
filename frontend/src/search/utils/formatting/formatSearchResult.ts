/**
 * Formats search result items for consistent display
 * Single responsibility: Search result data formatting
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
