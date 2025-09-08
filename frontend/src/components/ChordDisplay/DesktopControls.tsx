import React from 'react';
import AutoScrollControls from './components/AutoScrollControls';
import KeyMenu from './components/KeyMenu';
import CapoMenu from './components/CapoMenu';
import TextPreferencesMenu from './components/TextPreferencesMenu';
import CapoTransposeLink from './components/CapoTransposeLink';
import { ChordSheetControlsProps } from './types';
import StickyBottomContainer from '../StickyBottomContainer';
import { useAtBottom } from '@/hooks/useAtBottom';
import { useCapoTranspose } from '@/hooks/useCapoTranspose';

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

  // Use extracted capo-transpose logic
  const {
    handleCapoChange,
    handleTransposeChange,
    getCapoDisableStates,
    getTransposeDisableStates,
  } = useCapoTranspose({
    capo,
    setCapo,
    transpose,
    setTranspose,
    capoTransposeLinked,
  });

  const handleToggleLink = () => {
    if (setCapoTransposeLinked) {
      setCapoTransposeLinked(!capoTransposeLinked);
    }
  };

  return (
    <StickyBottomContainer
      isAtBottom={isAtBottom}
      desktopOnly
    >
      {/* Text Preferences */}
      <div className={`flex flex-col`}>
        <TextPreferencesMenu
          fontSize={fontSize} setFontSize={setFontSize}
          fontSpacing={fontSpacing} setFontSpacing={setFontSpacing}
          fontStyle={fontStyle} setFontStyle={setFontStyle}
          viewMode={viewMode} setViewMode={setViewMode}
        />
      </div>
      {/* Auto Scroll Controls */}
      <div className='flex flex-col items-start'>
        <AutoScrollControls
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          scrollSpeed={scrollSpeed}
          setScrollSpeed={setScrollSpeed}
        />
      </div>

      {/* Musical Controls Sub-Container */}
      <div className="flex items-end gap-1 justify-end">
        {/* Capo Menu */}
        <div className='flex flex-col items-center'>
          <CapoMenu
            capo={capo}
            setCapo={handleCapoChange}
            defaultCapo={defaultCapo}
            title="Capo Fret"
            disableIncrement={getCapoDisableStates().disableIncrement}
            disableDecrement={getCapoDisableStates().disableDecrement}
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
            disableIncrement={getTransposeDisableStates().disableIncrement}
            disableDecrement={getTransposeDisableStates().disableDecrement}
          />
        </div>
      </div>
    </StickyBottomContainer>
  );
};

export default DesktopControls;