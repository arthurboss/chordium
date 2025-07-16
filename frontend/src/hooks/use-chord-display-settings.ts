import { useState, useEffect } from 'react';
import { processContent, getTransposeOptions } from '@/utils/chord-sheet-utils';

/**
 * Custom hook to manage chord display settings
 * @param initialContent The initial chord sheet content
 * @returns Chord display settings and handlers
 */
export const useChordDisplaySettings = (initialContent: string) => {
  // Display settings
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [fontSpacing, setFontSpacing] = useState(0);
  const [fontStyle, setFontStyle] = useState('');
  const [viewMode, setViewMode] = useState("normal"); // "normal", "chords-only", "lyrics-only"
  const [hideGuitarTabs, setHideGuitarTabs] = useState(false);
  
  // Process the content with imported utility function
  const processedContent = processContent(initialContent, transpose);
  
  // Generate options for the transpose selector
  const transposeOptions = getTransposeOptions();

  return {
    // Settings
    transpose,
    setTranspose,
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
    processedContent,
    transposeOptions
  };
};
