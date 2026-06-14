import { useState, useEffect } from 'react';
import { processContent } from '@/utils/chord-sheet-utils';
import { songKeyToSemitones } from '@/utils/chordUtils';

export const useChordDisplaySettings = (initialContent: string, initialSongKey?: string, initialCapo?: number, initialViewMode?: string) => {
  const defaultTranspose = 0;
  const [transpose, setTranspose] = useState(defaultTranspose);
  
  const defaultCapo = initialCapo || 0;
  const [capo, setCapo] = useState(defaultCapo);
  
  useEffect(() => {
    setTranspose(0);
  }, [initialSongKey]);
  
  useEffect(() => {
    setCapo(initialCapo || 0);
  }, [initialCapo]);
  
  const [fontSize, setFontSize] = useState(14);
  const [fontSpacing, setFontSpacing] = useState(0);
  const [fontStyle, setFontStyle] = useState('');
  const [viewMode, setViewMode] = useState(initialViewMode || 'tabs-on');
  const [hideGuitarTabs, setHideGuitarTabs] = useState(false);
  const [capoTransposeLinked, setCapoTransposeLinked] = useState(false);
  
  const processedContent = processContent(initialContent, transpose);

  return {
    transpose,
    setTranspose,
    defaultTranspose,
    capo,
    setCapo,
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
    processedContent
  };
};
