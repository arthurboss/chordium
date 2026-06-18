import { useState, useEffect } from 'react';
import { processContent } from '@/utils/chord-sheet-utils';

export const useChordDisplaySettings = (initialContent: string, initialSongKey?: string, initialCapo?: number, initialViewMode?: string) => {
  const [fontStyle, setFontStyle] = useState('');
  const [viewMode, setViewMode] = useState(initialViewMode || 'tabs-on');

  const defaultTranspose = 0;
  const [transpose, setTranspose] = useState(defaultTranspose);
  const defaultCapo = initialCapo || 0;
  const [capo, setCapo] = useState(defaultCapo);
  const [capoTransposeLinked, setCapoTransposeLinked] = useState(false);

  useEffect(() => {
    setTranspose(0);
  }, [initialSongKey]);

  useEffect(() => {
    setCapo(initialCapo || 0);
  }, [initialCapo]);

  const processedContent = processContent(initialContent, transpose);

  return {
    fontStyle,
    viewMode,
    setViewMode,
    transpose,
    setTranspose,
    defaultTranspose,
    capo,
    setCapo,
    defaultCapo,
    capoTransposeLinked,
    setCapoTransposeLinked,
    processedContent,
  };
};
