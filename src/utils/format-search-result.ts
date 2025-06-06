import { Song } from "@/types/song";
import { SearchResultItem } from "./search-result-item";

export function formatSearchResult(item: SearchResultItem): Song {
  let title = item.title;

  // Extract cleaner title if it contains " - " (remove artist part)
  if (item.title.includes(" - ")) {
    const parts = item.title.split(" - ");
    title = parts[0].trim();
  } else {
    // Try to extract formatted title from URL if possible
    try {
      const url = new URL(item.url);
      const path = url.pathname.replace(/^\/|\/$/g, '');
      const segments = path.split('/');

      if (segments.length === 2) {
        const formattedTitle = segments[1]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        if (title === item.title) title = formattedTitle;
      }
    } catch (e) {
      console.error("Error parsing URL:", e);
    }
  }

  return {
    title: title,
    path: item.url,
    artist: item.artist,
  };
}
