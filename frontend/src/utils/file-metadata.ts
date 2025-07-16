/**
 * Extract title and artist from common filename formats
 * Supported formats:
 * - "Cifra Club - Artist - Title"
 * - "Artist - Title"
 * - Any other format will use the filename as title
 * 
 * @param fileName The filename (with or without extension)
 * @returns Object with extracted title and artist
 */
export function extractMetadataFromFilename(fileName: string): {title?: string, artist?: string} {
  const metadata: {title?: string, artist?: string} = {};
  
  if (!fileName) return metadata;
  
  // Remove file extension and numbering artifacts like (1)
  const fileNameWithoutExt = fileName
    .replace(/\.(pdf|PDF|txt|TXT|text|TEXT)$/, '')
    .replace(/\s*\(\d+\)$/, '');
  
  const parts = fileNameWithoutExt.split(" - ");
  
  if (parts.length >= 3 && parts[0].toLowerCase().includes('cifra club')) {
    // Filename has "Cifra Club - Artist - Title" format
    metadata.artist = parts[1].trim();
    metadata.title = parts[2].trim();
  } 
  else if (parts.length >= 2) {
    // Filename has "Artist - Title" format
    metadata.artist = parts[0].trim();
    metadata.title = parts[1].trim();
  } 
  else {
    // Just use filename as title (don't set it here, let the content extraction handle it)
  }
  
  return metadata;
}
