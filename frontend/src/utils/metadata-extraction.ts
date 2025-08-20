/**
 * Utility functions for extracting metadata from song chord sheets
 */

import { ChordSheet } from "@chordium/types";

/**
 * Song metadata structure
 */
export type SongMetadata = Partial<
  Omit<ChordSheet, "songChords" | "guitarTuning">
> & {
  guitarTuning?: string;
};

/**
 * Common section names that shouldn't be treated as titles
 */
const COMMON_SECTIONS = new Set([
  "intro",
  "verse",
  "chorus",
  "bridge",
  "outro",
  "solo",
  "pre-chorus",
  "refrain",
  "interlude",
  "hook",
  "breakdown",
  "pre-verse",
  "post-chorus",
  "instrumental",
  "coda",
  "tag",
]);

/**
 * Helper function to find the end index of the header region
 * @param lines Array of lines from the song content
 * @returns Index of the first section marker line or the length of lines
 */
function findHeaderEndIndex(lines: string[]): number {
  // Accept both [Section] and unbracketed section headers (e.g. Intro, Verse 1, Chorus:)
  const sectionNames = [
    "intro",
    "verse",
    "chorus",
    "bridge",
    "outro",
    "solo",
    "pre-chorus",
    "refrain",
    "interlude",
    "hook",
    "breakdown",
    "pre-verse",
    "post-chorus",
    "instrumental",
    "coda",
    "tag",
  ];
  const sectionRegexes = [
    /^\s*\[[^\]]+\]\s*$/i, // [Intro]
    new RegExp(`^\\s*(${sectionNames.join("|")})(\\s*\\d+)?[:.]?\\s*$`, "i"), // Intro, Verse 1, Chorus:
  ];
  for (let i = 0; i < lines.length; i++) {
    for (const regex of sectionRegexes) {
      if (regex.test(lines[i])) {
        return i;
      }
    }
  }
  return lines.length;
}

/**
 * Extracts metadata from the song content text
 * @param content The content of the song file
 * @param fileName Optional filename to extract metadata from first
 * @returns Object containing extracted metadata (title, artist, tunings)
 */
export function extractSongMetadata(
  content: string,
  fileName?: string
): SongMetadata {
  const metadata: SongMetadata = {};
  if (!content) return metadata;

  // Try to extract title and artist from filename first if provided
  if (fileName) {
    try {
      const fileNameWithoutExt = fileName
        .replace(/\.(pdf|PDF|txt|TXT|text|TEXT)$/, "")
        .replace(/\s*\(\d+\)$/, "");
      const parts = fileNameWithoutExt.split(" - ");
      if (parts.length >= 3 && parts[0].toLowerCase().includes("cifra club")) {
        metadata.artist = parts[1].trim();
        metadata.title = parts[2].trim();
      } else if (parts.length >= 2) {
        metadata.artist = parts[0].trim();
        metadata.title = parts[1].trim();
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error extracting metadata from filename:", error);
      }
    }
  }

  // Split by lines for analysis
  const lines = content.split("\n").slice(0, 50); // Analyze first 50 lines

  // Use improved header detection
  const headerEndIdx = findHeaderEndIndex(lines);
  const headerLines = lines.slice(0, headerEndIdx).join("\n");

  // Look for title patterns (use full content for fallback extraction)
  if (!metadata.title) {
    const titlePatterns = [
      /title\s*[:|-]\s*(.+)/i,
      /song\s*[:|-]\s*(.+)/i,
      /name\s*[:|-]\s*(.+)/i,
      /título\s*[:|-]\s*(.+)/i,
      /música\s*[:|-]\s*(.+)/i,
    ];
    let foundTitle = false;
    let titleLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of titlePatterns) {
        const match = lines[i].match(pattern);
        if (match && match[1]) {
          metadata.title = match[1].trim();
          foundTitle = true;
          titleLineIdx = i;
          break;
        }
      }
      if (foundTitle) break;
    }
    if (!foundTitle) {
      for (let i = 0; i < lines.length; i++) {
        const headerMatch = lines[i].match(/^\[(.+?)\]$/);
        if (headerMatch && !COMMON_SECTIONS.has(headerMatch[1].toLowerCase())) {
          metadata.title = headerMatch[1].trim();
          titleLineIdx = i;
          break;
        }
      }
      if (!metadata.title && !metadata.artist) {
        // Fallback: treat first non-empty, non-section line as artist or title
        for (let i = 0; i < Math.min(10, lines.length); i++) {
          const line = lines[i].trim();
          if (!line) continue;
          // Only skip if the line is exactly a section marker (no extra content)
          const isExactSectionMarker =
            /^\s*\[[^\]]+\]\s*$/i.test(line) ||
            /^\s*(intro|verse|chorus|bridge|outro|solo|pre-chorus|refrain|interlude|hook|breakdown|pre-verse|post-chorus|instrumental|coda|tag)(\s*\d+)?[:.]?\s*$/i.test(
              line
            );
          if (isExactSectionMarker) continue;
          // If line looks like 'Artist - Title', split
          const artistTitleMatch = line.match(/^(.+?)\s*[-–—]\s*(.+)$/i);
          if (artistTitleMatch && !line.startsWith("[")) {
            metadata.artist = artistTitleMatch[1].trim();
            metadata.title = artistTitleMatch[2].trim();
            break;
          }
          // If line is not a section marker, treat as artist, and look for title below
          metadata.artist = line;
          // Look for next non-empty, non-section line as title
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            const nextLine = lines[j].trim();
            if (!nextLine) continue;
            const isNextExactSectionMarker =
              /^\s*\[[^\]]+\]\s*$/i.test(nextLine) ||
              /^\s*(intro|verse|chorus|bridge|outro|solo|pre-chorus|refrain|interlude|hook|breakdown|pre-verse|post-chorus|instrumental|coda|tag)(\s*\d+)?[:.]?\s*$/i.test(
                nextLine
              );
            if (isNextExactSectionMarker) continue;
            // If next line is labeled as Song/Title, extract
            const nextTitleMatch = nextLine.match(
              /^(song|title)\s*[:|-]\s*(.+)$/i
            );
            if (nextTitleMatch) {
              metadata.title = nextTitleMatch[2].trim();
            } else {
              metadata.title = nextLine;
            }
            break;
          }
          break;
        }
      }
    }
    // If we found a title but not an artist, look above the title line for artist
    if (metadata.title && !metadata.artist && titleLineIdx > 0) {
      for (let k = titleLineIdx - 1; k >= 0; k--) {
        const prevLine = lines[k].trim();
        if (!prevLine) continue;
        const isExactSectionMarker =
          /^\s*\[[^\]]+\]\s*$/i.test(prevLine) ||
          /^\s*(intro|verse|chorus|bridge|outro|solo|pre-chorus|refrain|interlude|hook|breakdown|pre-verse|post-chorus|instrumental|coda|tag)(\s*\d+)?[:.]?\s*$/i.test(
            prevLine
          );
        if (isExactSectionMarker) continue;
        // Remove label if present
        const cleanedArtist = prevLine.replace(
          /^(artist|by|artista|compositor)\s*[:|-]?\s*/i,
          ""
        );
        metadata.artist = cleanedArtist;
        break;
      }
    }
  }

  // Look for artist patterns if we still don't have an artist
  if (!metadata.artist) {
    const artistPatterns = [
      /artist\s*[:|-]\s*(.+)/i,
      /by\s*[:|-]\s*(.+)/i,
      /performed by\s*[:|-]\s*(.+)/i,
      /written by\s*[:|-]\s*(.+)/i,
      /composer\s*[:|-]\s*(.+)/i,
      /artista\s*[:|-]\s*(.+)/i,
      /compositor\s*[:|-]\s*(.+)/i,
    ];
    for (const pattern of artistPatterns) {
      const match = headerLines.match(pattern);
      if (match && match[1]) {
        metadata.artist = match[1].trim();
        metadata.artist = metadata.artist.replace(/^by\s+/i, "");
        break;
      }
    }
  }

  // Look for tuning information (only in header)
  const tuningPatterns = [
    /tuning\s*[:|-]\s*(.+)/i,
    /guitar tuning\s*[:|-]\s*(.+)/i,
    /afinação\s*[:|-]?\s*(.+)/i,
    /capo\s*[:|-]?\s*(?:on)?\s*(?:fret)?\s*(\d+)/i,
    /capotraste\s*[:|-]?\s*(\d+)/i,
  ];
  for (const pattern of tuningPatterns) {
    const match = headerLines.match(pattern);
    if (match && match[1]) {
      const matchedText = match[1].trim();
      if (match[0].toLowerCase().includes("capo")) {
        metadata.guitarCapo = parseInt(matchedText, 10);
      } else {
        metadata.guitarTuning = matchedText;
      }
      break;
    }
  }
  // Look specifically for standard guitar tuning notation (only in header)
  if (!metadata.guitarTuning) {
    const standardTuningPatterns = [
      /(standard tuning|e\s*a\s*d\s*g\s*b\s*e|eadgbe|drop d|drop c|open g)/i,
      /\b([A-G][#b]?)\s+([A-G][#b]?)\s+([A-G][#b]?)\s+([A-G][#b]?)\s+([A-G][#b]?)\s+([A-G][#b]?)\b/i,
      /(afinação\s+padrão|padrão|standard)/i,
    ];
    for (const pattern of standardTuningPatterns) {
      const match = headerLines.match(pattern);
      if (match) {
        if (match.length >= 7) {
          metadata.guitarTuning = `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]} ${match[6]}`;
        } else {
          metadata.guitarTuning = match[0].trim();
        }
        break;
      }
    }
  }
  // Look for key/scale information that might indicate song key (only in header)
  if (!metadata.songKey) {
    const keyPatterns = [
      /key\s*[:|-]\s*([A-G][#b]?\s*(major|minor|maj|min|m)?)/i,
      /in\s+([A-G][#b]?\s*(major|minor|maj|min|m)?)/i,
      /tom\s*[:|-]?\s*([A-G][#b]?\s*(maior|menor|maj|min|m)?)/i,
      /^([A-G][#b]?\s*(major|minor|maj|min|m))$/im,
      /^([A-G][#b]?\s*(maior|menor|maj|min|m))$/im,
      /^([A-G][#b]?m?)$/im,
    ];
    for (const pattern of keyPatterns) {
      const match = headerLines.match(pattern);
      if (match && match[1]) {
        metadata.songKey = match[1].trim();
        break;
      }
    }
  }
  return metadata;
}
