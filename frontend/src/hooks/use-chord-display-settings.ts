import { useState, useEffect } from 'react';
import { processContent } from '@/utils/chord-sheet-utils';
import { songKeyToSemitones } from '@/utils/chordUtils';
import { useJamSession } from '@/contexts/JamSessionContext';
import { SetStateAction, useCallback } from 'react';

/**
 * Custom hook to manage chord display settings
 * @param initialContent The initial chord sheet content
 * @param initialSongKey The initial song key to set as default transpose value
 * @param initialCapo The initial capo position
 * @returns Chord display settings and handlers
 */
export const useChordDisplaySettings = (
  initialContent: string, 
  initialSongKey?: string, 
  initialCapo?: number,
  title?: string,
  artist?: string
) => {
  const { role, sessionState, broadcastState } = useJamSession();
  // Display settings - initialize transpose to 0 (no transpose by default)
  // The songKey is used for display purposes only, not for transposing the content
  const defaultTranspose = 0;
  const [transpose, setTranspose] = useState(defaultTranspose);
  
  // Capo settings - initialize with the original capo position
  const defaultCapo = initialCapo || 0;
  const [capo, setCapo] = useState(defaultCapo);
  
  // Update transpose when initialSongKey changes (e.g., when loading a different song)
  // Always reset to 0 when loading a new song
  useEffect(() => {
    setTranspose(0);
  }, [initialSongKey]);
  
  // Update capo when initialCapo changes (e.g., when loading a different song)
  useEffect(() => {
    setCapo(initialCapo || 0);
  }, [initialCapo]);

  // Sync with Jam Session state (Peer)
  useEffect(() => {
    if (role === 'peer') {
      setTranspose(sessionState.transpose);
      setCapo(sessionState.capo);
    }
  }, [role, sessionState.transpose, sessionState.capo]);
  
  // Custom setters to handle broadcasting (Host)
  const handleSetTranspose = useCallback((value: SetStateAction<number>) => {
    setTranspose(prev => {
      const newValue = typeof value === 'function' ? (value as Function)(prev) : value;
      if (role === 'host') {
        broadcastState({ transpose: newValue });
      }
      return newValue;
    });
  }, [role, broadcastState]);

  const handleSetCapo = useCallback((value: SetStateAction<number>) => {
    setCapo(prev => {
      const newValue = typeof value === 'function' ? (value as Function)(prev) : value;
      if (role === 'host') {
        broadcastState({ capo: newValue });
      }
      return newValue;
    });
  }, [role, broadcastState]);
  
  const [fontSize, setFontSize] = useState(16);
  const [fontSpacing, setFontSpacing] = useState(0);
  const [fontStyle, setFontStyle] = useState('');
  const [viewMode, setViewMode] = useState("normal"); // "normal", "chords-only", "lyrics-only"
  const [hideGuitarTabs, setHideGuitarTabs] = useState(false);
  const [capoTransposeLinked, setCapoTransposeLinked] = useState(false);
  
  
  // Host: Broadcast content and metadata when it changes
  useEffect(() => {
    if (role === 'host') {
      broadcastState({ 
        songContent: initialContent,
        songTitle: title,
        songArtist: artist
      });
    }
  }, [role, initialContent, title, artist, broadcastState]);

  // Process the content with imported utility function
  // If peer, use content from session if available
  const contentToUse = (role === 'peer' && sessionState.songContent) ? sessionState.songContent : initialContent;
  const processedContent = processContent(contentToUse, transpose);

  return {
    // Settings
    transpose,
    setTranspose: handleSetTranspose,
    defaultTranspose,
    capo,
    setCapo: handleSetCapo,
    defaultCapo,
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
    capoTransposeLinked,
    setCapoTransposeLinked,
    
    // Processed data
    processedContent
  };
};
