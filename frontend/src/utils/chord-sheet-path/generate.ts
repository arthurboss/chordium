/**
 * Generates chord sheet paths from artist and title
 */

import { normalizeNamePart } from "./normalize";

/**
 * Generates a chord sheet path from artist and title
 * Format: artist-name_song-title
 * 
 * @param artist - Artist name
 * @param title - Song title
 * @returns Normalized path string
 */
export function generateChordSheetPath(artist: string, title: string): string {
  const normalizedArtist = normalizeNamePart(artist);
  const normalizedTitle = normalizeNamePart(title);
  
  return `${normalizedArtist}_${normalizedTitle}`;
}
