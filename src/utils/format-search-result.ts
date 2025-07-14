import { Song } from "@/types/song";

// Since the backend now returns unified Song objects, this function
// primarily ensures consistent formatting but no longer needs conversion
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
