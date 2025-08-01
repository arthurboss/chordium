import { generateChordSheetPath, chordSheetPathToStoragePath } from "@/utils/chord-sheet-path";
import type { RouteParams } from "../chord-viewer.types";

/**
 * Converts URL route parameters to chord sheet storage path
 * 
 * @param routeParams - URL route parameters
 * @returns Converted chord sheet path for storage lookup
 */
export function convertUrlParamsToPath(routeParams: RouteParams): string {
  const { artist, song } = routeParams;
  
  if (artist && song) {
    const decodedArtist = decodeURIComponent(artist.replace(/-/g, ' '));
    const decodedSong = decodeURIComponent(song.replace(/-/g, ' '));
    
    return chordSheetPathToStoragePath(
      generateChordSheetPath(decodedArtist, decodedSong)
    );
  }
  
  return '';
}
