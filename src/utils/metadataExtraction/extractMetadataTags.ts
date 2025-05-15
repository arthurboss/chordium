/**
 * Utility functions for extracting metadata tags from song content
 */

export interface ContentMetadata {
  title?: string;
  artist?: string;
  songTuning?: string;
  guitarTuning?: string;
}

/**
 * Extract metadata from special tags in the content
 * Format: [tag]value[/tag]
 * @param content The song content text
 * @returns Extracted metadata object and filtered content with tags removed
 */
export function extractMetadataTags(content: string): { 
  metadata: ContentMetadata; 
  filteredContent: string;
  tagsFound: boolean;
} {
  const lines = content.split('\n');
  const metadata: ContentMetadata = {};
  let tagsFound = false;

  const titleLine = lines.find(line => line.match(/^\[title\](.+)\[\/title\]$/i));
  const artistLine = lines.find(line => line.match(/^\[artist\](.+)\[\/artist\]$/i));
  const songTuningLine = lines.find(line => line.match(/^\[songtuning\](.+)\[\/songtuning\]$/i));
  const guitarTuningLine = lines.find(line => line.match(/^\[guitartuning\](.+)\[\/guitartuning\]$/i));

  if (titleLine) {
    const titleMatch = titleLine.match(/^\[title\](.+)\[\/title\]$/i);
    if (titleMatch && titleMatch[1]) {
      metadata.title = titleMatch[1].trim();
      tagsFound = true;
    }
  }

  if (artistLine) {
    const artistMatch = artistLine.match(/^\[artist\](.+)\[\/artist\]$/i);
    if (artistMatch && artistMatch[1]) {
      metadata.artist = artistMatch[1].trim();
      tagsFound = true;
    }
  }

  if (songTuningLine) {
    const songTuningMatch = songTuningLine.match(/^\[songtuning\](.+)\[\/songtuning\]$/i);
    if (songTuningMatch && songTuningMatch[1]) {
      metadata.songTuning = songTuningMatch[1].trim();
      tagsFound = true;
    }
  }

  if (guitarTuningLine) {
    const guitarTuningMatch = guitarTuningLine.match(/^\[guitartuning\](.+)\[\/guitartuning\]$/i);
    if (guitarTuningMatch && guitarTuningMatch[1]) {
      metadata.guitarTuning = guitarTuningMatch[1].trim();
      tagsFound = true;
    }
  }

  // If tags were found, filter them out and clean up the content
  let filteredContent = content;

  if (tagsFound) {
    const filteredLines = lines.filter(line => 
      !line.match(/^\[title\](.+)\[\/title\]$/i) && 
      !line.match(/^\[artist\](.+)\[\/artist\]$/i) &&
      !line.match(/^\[songtuning\](.+)\[\/songtuning\]$/i) &&
      !line.match(/^\[guitartuning\](.+)\[\/guitartuning\]$/i)
    );
    
    // Remove any empty lines at the beginning
    while (filteredLines.length > 0 && filteredLines[0].trim() === '') {
      filteredLines.shift();
    }
    
    // Find the first line containing "intro" in any case
    const introIndex = filteredLines.findIndex(line => line.toLowerCase().includes('intro'));
    if (introIndex > 0) {
      // Keep the intro line itself
      const introLine = filteredLines[introIndex];
      filteredLines.splice(0, introIndex);
      // Add back the intro line with proper formatting
      filteredLines.unshift('[intro]');
    }
    
    filteredContent = filteredLines.join('\n');
  }

  return { 
    metadata, 
    filteredContent,
    tagsFound
  };
}
