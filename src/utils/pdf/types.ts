/**
 * Interface for text item with position
 */
export interface TextItemWithPosition {
  text: string;
  y: number;
  x: number;
}

/**
 * Interface for extracted metadata
 */
export interface ExtractedMetadata {
  songTitle: string;
  artistName: string;
}
