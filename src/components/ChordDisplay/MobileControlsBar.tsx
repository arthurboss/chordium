import React, { memo, useMemo } from 'react';
import { TextPreferences, useScrollPosition } from './shared';
import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';
import { ChordSheetControlsProps } from './types';

/**
 * Mobile controls bar for chord sheet display
 * Shows a compact floating button bar with menus that expand when needed
 * Implements performance optimizations with useMemo
 */
const MobileControlsBar: React.FC<Pick<ChordSheetControlsProps, 
  'fontSize' | 'setFontSize' |
  'fontSpacing' | 'setFontSpacing' |
  'fontStyle' | 'setFontStyle' |
  'lineHeight' | 'setLineHeight' |
  'viewMode' | 'setViewMode' |
  'hideGuitarTabs' | 'setHideGuitarTabs' |
  'autoScroll' | 'setAutoScroll' |
  'scrollSpeed' | 'setScrollSpeed'
>> = ({
  fontSize,
  setFontSize,
  fontSpacing,
  setFontSpacing,
  fontStyle,
  setFontStyle,
  lineHeight,
  setLineHeight,
  viewMode,
  setViewMode,
  hideGuitarTabs,
  setHideGuitarTabs,
  autoScroll,
  setAutoScroll,
  scrollSpeed,
  setScrollSpeed,
}) => {
  // Track scroll position to adjust UI
  const isAtBottom = useScrollPosition({ threshold: 185 });
  
  // Only calculate the className once per render - not worth memoizing
  // Removed sm:hidden class since we're using useIsMobile hook for conditional rendering
  const containerClassName = `sticky bottom-2 m-2 mt-0 z-40 bg-background/70 backdrop-blur-sm flex items-center p-2 border rounded-lg transition-all duration-200 ${isAtBottom ? 'mx-0' : 'mx-4'} ${!autoScroll && 'w-fit ml-auto'}`;
  
  // Only memoize TextPreferences since it's complex with many props and options
  const menuButtons = useMemo(() => (
    <TextPreferences
      fontSize={fontSize}
      setFontSize={setFontSize}
      fontSpacing={fontSpacing}
      setFontSpacing={setFontSpacing}
      fontStyle={fontStyle}
      setFontStyle={setFontStyle}
      lineHeight={lineHeight}
      setLineHeight={setLineHeight}
      viewMode={viewMode}
      setViewMode={setViewMode}
      hideGuitarTabs={hideGuitarTabs}
      setHideGuitarTabs={setHideGuitarTabs}
      buttonClassName="h-10 w-10"
      iconSize={20}
      isAtBottom={isAtBottom}
    />
  ), [
    fontSize, setFontSize, 
    fontSpacing, setFontSpacing, 
    fontStyle, setFontStyle, 
    lineHeight, setLineHeight, 
    viewMode, setViewMode, 
    hideGuitarTabs, setHideGuitarTabs,
    isAtBottom
  ]);

  return (
    <div className={containerClassName}>
      {/* When not playing, TextPreferences and Play on the right */}
      {!autoScroll && (
        <div className="flex items-center ml-auto">
          {menuButtons}
          <PlayButton
            autoScroll={autoScroll}
            setAutoScroll={setAutoScroll}
            size={20}
            className={`h-10 w-10 ml-2 ${autoScroll && 'bg-secondary/20 text-primary hover:bg-primary/20'}`}
          />
        </div>
      )}
      
      {/* When playing, TextPreferences on far left, SpeedControl, Play on far right */}
      {autoScroll && (
        <>
          <div className="flex items-center mr-auto" style={{ marginLeft: 0, paddingLeft: 0 }}>
            {menuButtons}
          </div>
          <div className="transition-all duration-200 animate-in slide-in-from-right-16 flex-1 flex items-center justify-center px-2">
            <SpeedControl
              autoScroll={autoScroll}
              scrollSpeed={scrollSpeed}
              setScrollSpeed={setScrollSpeed}
            />
          </div>
          <PlayButton
            autoScroll={autoScroll}
            setAutoScroll={setAutoScroll}
            size={20}
            className={`h-10 w-10 ml-2 ${autoScroll && 'bg-primary/10 text-primary hover:bg-primary/20'}`}
          />
        </>
      )}
    </div>
  );
};

export default MobileControlsBar;