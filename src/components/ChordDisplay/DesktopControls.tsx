import React from 'react';
import { CardContent } from '../ui/card';
import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';
import StickyBottomContainer from '../StickyBottomContainer';
import { useStickyAtBottom } from '@/hooks/use-sticky-at-bottom';
import TextPreferences from './TextPreferencesMenu';
import TransposeMenu from './TransposeMenu';
import { ChordSheetControlsProps } from './types';

const DesktopControls: React.FC<ChordSheetControlsProps> = ({
  transpose,
  setTranspose,
  transposeOptions,
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
  autoScroll,
  setAutoScroll,
  scrollSpeed,
  setScrollSpeed,
}) => {
  const isAtBottom = useStickyAtBottom();

  return (
    <StickyBottomContainer isAtBottom={isAtBottom} desktopOnly>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col space-y-3">
            <div className="grid grid-cols-3 items-center gap-2" style={{ gridTemplateColumns: '180px 1fr 180px' }}>
              {/* Left: Play/Pause (Auto Scroll) button */}
              <div className="flex items-center justify-start">
                <PlayButton
                  autoScroll={autoScroll}
                  setAutoScroll={setAutoScroll}
                  size={16}
                  className={`h-8 w-auto px-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-0 ${autoScroll && 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                  variant="outline"
                />
                {/* Speed controls only show when playing, always between PlayButton and Transpose */}
                {autoScroll && (
                  <div className="ml-2 transition-all duration-300 animate-in slide-in-from-left-2">
                    <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
                  </div>
                )}
              </div>
              {/* Center: Transpose always centered and fixed */}
              <div className="flex items-center justify-center">
                <TransposeMenu transpose={transpose} setTranspose={setTranspose} transposeOptions={transposeOptions} />
              </div>
              {/* Right: Text Preferences */}
              <div className="flex items-center justify-end">
                <TextPreferences
                  fontSize={fontSize} setFontSize={setFontSize}
                  fontSpacing={fontSpacing} setFontSpacing={setFontSpacing}
                  fontStyle={fontStyle} setFontStyle={setFontStyle}
                  viewMode={viewMode} setViewMode={setViewMode}
                  hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
                />
              </div>
            </div>
          </div>
        </CardContent>
    </StickyBottomContainer>
  );
};

export default DesktopControls;