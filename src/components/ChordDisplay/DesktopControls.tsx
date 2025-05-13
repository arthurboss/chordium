import React, { memo, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { useScrollPosition, TransposeMenu, TextPreferencesMenu } from './shared';
import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';
import { ChordSheetControlsProps } from './types';

/**
 * Desktop controls for chord sheet display
 * Shows a fixed bar at bottom of screen with controls for playback and display
 * Implements performance optimizations with useMemo
 */
const DesktopControls: React.FC<Pick<ChordSheetControlsProps, 
  'transpose' | 'setTranspose' | 'transposeOptions' |
  'fontSize' | 'setFontSize' |
  'fontSpacing' | 'setFontSpacing' |
  'fontStyle' | 'setFontStyle' |
  'lineHeight' | 'setLineHeight' |
  'viewMode' | 'setViewMode' |
  'autoScroll' | 'setAutoScroll' |
  'scrollSpeed' | 'setScrollSpeed'
>> = ({
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
  autoScroll,
  setAutoScroll,
  scrollSpeed,
  setScrollSpeed,
}) => {
  // Track scroll position to adjust UI
  const isAtBottom = useScrollPosition({
    responsiveThresholds: [
      { mediaQuery: '(min-width: 768px) and (max-width: 1023px)', threshold: 100 }
    ]
  });
  
  // Only memoize the transpose menu component which is likely to benefit most from memoization
  // Since it's in the center of the layout and less likely to change frequently
  const transposeMenuComponent = useMemo(() => (
    <TransposeMenu 
      transpose={transpose} 
      setTranspose={setTranspose} 
      transposeOptions={transposeOptions} 
    />
  ), [transpose, setTranspose, transposeOptions]);

  return (
    <Card className={`sticky bottom-4 mb-4 transition-all duration-200 ${isAtBottom ? 'mx-0' : 'mx-3'} bg-background/70 backdrop-blur-sm`}>
      <CardContent className="p-3">
        <div className="flex flex-col space-y-3">
          <div className="grid grid-cols-3 items-center gap-2" style={{ gridTemplateColumns: '180px 1fr 180px' }}>
            {/* Left: Play/Pause (Auto Scroll) button */}
            <div className="flex items-center justify-start">
              <PlayButton
                autoScroll={autoScroll}
                setAutoScroll={setAutoScroll}
                size={16}
                className={`h-8 w-auto px-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-0 ${autoScroll ? 'bg-primary/10 text-primary hover:bg-primary/20 border-secondary/30' : ''}`}
              />
              {/* Speed controls only show when playing */}
              {autoScroll && (
                <div className="ml-2 transition-all duration-300 animate-in slide-in-from-left-2">
                  <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
                </div>
              )}
            </div>
            
            {/* Center: Transpose always centered and fixed - keep memoized */}
            <div className="flex items-center justify-center">
              {transposeMenuComponent}
            </div>
            
            {/* Right: Text Preferences */}
            <div className="flex items-center justify-end">
              <TextPreferencesMenu
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
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(DesktopControls);