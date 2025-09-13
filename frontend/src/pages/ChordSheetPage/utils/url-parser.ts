import type { RouteParams } from "../../chord-viewer/chord-viewer.types";

/**
 * Extracts title and artist from URL parameters for better UX
 * 
 * @param routeParams - URL route parameters
 * @returns Object with extracted title and artist
 */
export const extractTitleAndArtistFromUrl = (routeParams: RouteParams) => {
  const title = routeParams.song ? routeParams.song.replace(/-/g, ' ') : "Loading...";
  const artist = routeParams.artist ? routeParams.artist.replace(/-/g, ' ') : "Loading...";
  
  return { title, artist };
};
