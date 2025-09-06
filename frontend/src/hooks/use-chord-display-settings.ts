import { useState, useEffect } from 'react';
import { processContent } from '@/utils/chord-sheet-utils';
import { songKeyToSemitones } from '@/utils/chordUtils';

/**
 * Custom hook to manage chord display settings
 * @param initialContent The initial chord sheet content
 * @param initialSongKey The initial song key to set as default transpose value
 * @returns Chord display settings and handlers
 */
export const useChordDisplaySettings = (initialContent: string, initialSongKey?: string) => {
  // Display settings - initialize transpose to 0 (no transpose by default)
  // The songKey is used for display purposes only, not for transposing the content
  const defaultTranspose = 0;
  const [transpose, setTranspose] = useState(defaultTranspose);
  
  // Update transpose when initialSongKey changes (e.g., when loading a different song)
  // Always reset to 0 when loading a new song
  useEffect(() => {
    setTranspose(0);
  }, [initialSongKey]);
  const [fontSize, setFontSize] = useState(16);
  const [fontSpacing, setFontSpacing] = useState(0);
  const [fontStyle, setFontStyle] = useState('');
  const [viewMode, setViewMode] = useState("normal"); // "normal", "chords-only", "lyrics-only"
  const [hideGuitarTabs, setHideGuitarTabs] = useState(false);
  
  // Process the content with imported utility function
  const processedContent = processContent(initialContent, transpose);

  return {
    // Settings
    transpose,
    setTranspose,
    defaultTranspose,
    fontSize, 
    setFontSize,
    fontSpacing,
    setFontSpacing,
    fontStyle,
    setFontStyle,
    viewMode,
    setViewMode,
    hideGuitarTabs,
    setHideGuitarTabs,
    
    // Processed data
    processedContent
  };
};
