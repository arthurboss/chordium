import React, { memo } from 'react';
import { ChordSheetControlsProps } from './types';
import { useIsMobile } from '../../hooks/use-mobile';
// Import from shared for better code organization
import { MobileControlsBar, DesktopControls } from './shared';

/**
 * Unified component for chord sheet controls
 * Renders either mobile or desktop controls based on viewport size
 * Uses useIsMobile hook instead of CSS media queries for better control
 */
const ChordSheetControls: React.FC<ChordSheetControlsProps> = ({
  transpose,
  setTranspose,
  transposeOptions,
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
  setScrollSpeed
}) => {
  const isMobile = useIsMobile();
  
  return (
    <>
      {!isMobile ? (
        <DesktopControls
          transpose={transpose}
          setTranspose={setTranspose}
          transposeOptions={transposeOptions}
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
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          scrollSpeed={scrollSpeed}
          setScrollSpeed={setScrollSpeed}
        />
      ) : (
        <MobileControlsBar
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
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          scrollSpeed={scrollSpeed}
          setScrollSpeed={setScrollSpeed}
        />
      )}
    </>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(ChordSheetControls); 