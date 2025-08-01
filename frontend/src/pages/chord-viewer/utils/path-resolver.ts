import { generateChordSheetPath, chordSheetPathToStoragePath } from "@/utils/chord-sheet-path";
import type { RouteParams } from "../chord-viewer.types";

/**
 * Resolves the chord sheet path from URL parameters
 * 
 * @param routeParams - URL route parameters
 * @returns Resolved chord sheet path for storage lookup
 */
export function resolveChordSheetPath(routeParams: RouteParams): string {
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

/**
 * Decodes URL parameter by replacing hyphens with spaces and URI decoding
 * 
 * @param param - URL parameter to decode
 * @returns Decoded string
 */
export function decodeUrlParameter(param: string): string {
  return decodeURIComponent(param.replace(/-/g, ' '));
}
