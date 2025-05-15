/**
 * Main metadata extraction utility that combines all extraction methods
 */

import { extractMetadataTags, ContentMetadata } from './extractMetadataTags';
import { extractMetadataFromFilename } from './extractMetadataFromFilename';
import { extractTuningFromContent } from './extractTuningFromContent';

export interface ExtractedSongData {
  title: string;
  artist: string;
  songTuning: string;
  guitarTuning: string;
  content: string;
}

/**
 * Extract all metadata from a song file using multiple extraction methods
 * Priority order:
 * 1. Metadata tags in content
 * 2. Filename parsing for title and artist
 * 3. Content analysis for tuning information
 * 
 * @param content The song content text
 * @param fileName The filename (with or without extension)
 * @returns Fully processed song data with extracted metadata and cleaned content
 */
export function extractSongMetadata(
  content: string, 
  fileName: string
): ExtractedSongData {
  // First check for metadata tags in the content
  const { metadata: tagMetadata, filteredContent, tagsFound } = extractMetadataTags(content);
  
  // Initialize with empty values
  let extractedTitle = tagMetadata.title || "";
  let extractedArtist = tagMetadata.artist || "";
  let extractedSongTuning = tagMetadata.songTuning || "";
  let extractedGuitarTuning = tagMetadata.guitarTuning || "";
  
  // If tags weren't found or didn't have complete metadata, try filename
  if (!extractedTitle || !extractedArtist) {
    const filenameMetadata = extractMetadataFromFilename(fileName);
    if (!extractedTitle) extractedTitle = filenameMetadata.title || "";
    if (!extractedArtist) extractedArtist = filenameMetadata.artist || "";
  }
  
  // If tuning information is still missing, try to extract from content
  if (!extractedSongTuning || !extractedGuitarTuning) {
    const tuningMetadata = extractTuningFromContent(tagsFound ? filteredContent : content);
    if (!extractedSongTuning) extractedSongTuning = tuningMetadata.songTuning || "";
    if (!extractedGuitarTuning) extractedGuitarTuning = tuningMetadata.guitarTuning || "";
  }
  
  return {
    title: extractedTitle || "Untitled Song",
    artist: extractedArtist || "",
    songTuning: extractedSongTuning,
    guitarTuning: extractedGuitarTuning,
    content: tagsFound ? filteredContent : content
  };
}
