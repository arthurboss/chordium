import React from 'react';
import { CardContent } from '../ui/card';
import AutoScrollControls from './components/AutoScrollControls';
import KeyMenu from './components/KeyMenu';
import CapoMenu from './components/CapoMenu';
import TextPreferencesMenu from './components/TextPreferencesMenu';
import CapoTransposeLink from './components/CapoTransposeLink';
import { ChordSheetControlsProps } from './types';
import StickyBottomContainer from '../StickyBottomContainer';
import { useAtBottom } from '@/hooks/useAtBottom';

const DesktopControls: React.FC<ChordSheetControlsProps> = ({
  transpose,
  setTranspose,
  defaultTranspose = 0,
  songKey,
  capo,
  setCapo,
  defaultCapo = 0,
  fontSize,
  setFontSize,
  fontSpacing,
  setFontSpacing,
  fontStyle,
  setFontStyle,
  viewMode,
  setViewMode,
  autoScroll,
  setAutoScroll,
  scrollSpeed,
  setScrollSpeed,
  capoTransposeLinked = false,
  setCapoTransposeLinked,
}) => {
  const isAtBottom = useAtBottom();

  // Handle capo-transpose linking logic
  const handleCapoChange = (newCapo: number) => {
    setCapo(newCapo);

    // If linked, adjust transpose inversely
    if (capoTransposeLinked && setCapoTransposeLinked) {
      const capoDifference = newCapo - capo;
      const newTranspose = transpose - capoDifference;
      
      // Clamp transpose to valid range (-11 to +11)
      const clampedTranspose = Math.max(-11, Math.min(11, newTranspose));
      
      setTranspose(clampedTranspose);
    }
  };

  const handleTransposeChange = (newTranspose: number) => {
    setTranspose(newTranspose);

    // If linked, adjust capo inversely
    if (capoTransposeLinked && setCapoTransposeLinked) {
      const transposeDifference = newTranspose - transpose;
      const newCapo = capo - transposeDifference;
      
      // Clamp capo to valid range (0-11)
      const clampedCapo = Math.max(0, Math.min(11, newCapo));
      
      setCapo(clampedCapo);
    }
  };

  const handleToggleLink = () => {
    if (setCapoTransposeLinked) {
      setCapoTransposeLinked(!capoTransposeLinked);
    }
  };

  return (
    <StickyBottomContainer isAtBottom={isAtBottom} desktopOnly>
      {/* Left: Auto Scroll Controls */}
      <div className='flex flex-col items-center'>
        <AutoScrollControls
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          scrollSpeed={scrollSpeed}
          setScrollSpeed={setScrollSpeed}
          title="Scroll"
        />
      </div>

      {/* Center: Musical Controls Sub-Container */}
      <div className='flex items-center justify-center gap-1'>
        {/* Capo Menu */}
        <div className='flex flex-col items-center'>
          <CapoMenu
            capo={capo}
            setCapo={handleCapoChange}
            defaultCapo={defaultCapo}
            title="Capo Fret"
          />
        </div>
        {/* Link Button */}
        <div className='flex flex-col items-center'>
          <CapoTransposeLink
            isLinked={capoTransposeLinked}
            onToggle={handleToggleLink}
            title="Link"
          />
        </div>
        {/* Transpose Menu */}
        <div className='flex flex-col items-center'>
          <KeyMenu
            transpose={transpose}
            setTranspose={handleTransposeChange}
            defaultTranspose={defaultTranspose}
            songKey={songKey}
            title="Transpose"
          />
        </div>
      </div>

      {/* Right: Text Preferences */}
      <div className='flex flex-col items-center'>
        <TextPreferencesMenu
          fontSize={fontSize} setFontSize={setFontSize}
          fontSpacing={fontSpacing} setFontSpacing={setFontSpacing}
          fontStyle={fontStyle} setFontStyle={setFontStyle}
          viewMode={viewMode} setViewMode={setViewMode}
          title="Style"
        />
      </div>
    </StickyBottomContainer>
  );
};

export default DesktopControls;