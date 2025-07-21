import type { TitleArtistResult } from "../../shared/types/index.js";

/**
 * Utility functions for parsing titles and extracting artist information from CifraClub results
 */

/**
 * Clean title by removing the "- Cifra Club" suffix
 */
export function cleanCifraClubTitle(title: string): string {
  if (!title) return "";
  return title
    .trim()
    .replace(/ - Cifra Club$/, "")
    .trim();
}

/**
 * Extract title and artist from CifraClub title format: "Song Title - Artist Name"
 */
export function extractTitleAndArtist(rawTitle: string): TitleArtistResult {
  if (!rawTitle) {
    return { title: "", artist: "" };
  }

  // First clean the title by removing "- Cifra Club" suffix
  const cleanTitle = cleanCifraClubTitle(rawTitle);

  // Split by " - " to separate song and artist
  const parts = cleanTitle.split(" - ");

  if (parts.length >= 2) {
    // Format: "Song Title - Artist Name"
    // Join all parts except the last one as title (handles multiple " - " in song title)
    const title = parts.slice(0, -1).join(" - ").trim();
    const artist = parts[parts.length - 1].trim(); // Take the last part as artist
    return { title, artist };
  }

  // If no " - " separator found, use the whole clean title as song title with empty artist
  return {
    title: cleanTitle,
    artist: "",
  };
}
