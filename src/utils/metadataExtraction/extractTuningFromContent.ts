/**
 * Utility functions for extracting tuning information from song content
 */

import { ContentMetadata } from './extractMetadataTags';

/**
 * Extract song tuning and guitar tuning from the content
 * Looks for tuning information in the content before the [intro] section
 * 
 * @param content The song content text
 * @returns Metadata object with extracted tuning information
 */
export function extractTuningFromContent(content: string): ContentMetadata {
  const metadata: ContentMetadata = {};
  if (!content) return metadata;
  
  const lines = content.split('\n');
  
  // Find the first line containing "intro" in any case
  const introIndex = lines.findIndex(line => line.toLowerCase().includes('intro'));
  
  if (introIndex > 0) {
    const preIntroLines = lines.slice(0, introIndex);
    
    // Look for tuning patterns in a more generic way
    for (const line of preIntroLines) {
      // Check for song tuning (Tom)
      if (!metadata.songTuning) {
        // Look for the first line containing "Tom" and extract everything after the colon/equals
        if (line.toLowerCase().includes('tom')) {
          const afterColon = line.split(/[:=]/)[1]?.trim();
          if (afterColon) {
            metadata.songTuning = afterColon;
          }
        }
      }
      
      // Check for guitar tuning
      if (!metadata.guitarTuning) {
        // Look for lines containing 6 notes separated by spaces
        const tuningMatch = line.match(/((?:[A-G][#b]?\s+){5}[A-G][#b]?)/i);
        if (tuningMatch) {
          metadata.guitarTuning = tuningMatch[1].trim();
        }
      }
      
      // If we found both tunings, we can stop
      if (metadata.songTuning && metadata.guitarTuning) {
        break;
      }
    }
  }
  
  return metadata;
}
