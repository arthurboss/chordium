import { v4 as uuidv4 } from "uuid";
import { SongData } from "@/types/song";
import { SearchResultItem } from "./search-result-item";

export function formatSearchResult(item: SearchResultItem): SongData {
  let artist = "";
  let title = item.title;

  if (item.title.includes(" - ")) {
    const parts = item.title.split(" - ");
    title = parts[0].trim();
    artist = parts[1].trim();
  } else {
    try {
      const url = new URL(item.url);
      const path = url.pathname.replace(/^\/|\/$/g, '');
      const segments = path.split('/');

      if (segments.length === 2) {
        const formattedArtist = segments[0]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        const formattedTitle = segments[1]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        if (!artist) artist = formattedArtist;
        if (title === item.title) title = formattedTitle;
      }
    } catch (e) {
      console.error("Error parsing URL:", e);
    }
  }

  return {
    id: uuidv4(),
    title: title,
    artist: artist,
    path: item.url,
  };
}
