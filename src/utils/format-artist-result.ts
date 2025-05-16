import { ArtistData } from "@/types/artist";
import { SearchResultItem } from "./search-result-item";

export function formatArtistResult(item: SearchResultItem): ArtistData {
  let artistName = item.title;
  
  // If the URL contains segments that can be used to extract a better artist name
  try {
    const url = new URL(item.url);
    const path = url.pathname.replace(/^\/|\/$/g, '');
    
    // If it's a direct artist URL without song part
    if (!path.includes('/')) {
      artistName = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  } catch (e) {
    console.error("Error parsing URL:", e);
  }

  return {
    name: artistName,
    url: item.url
  };
}
