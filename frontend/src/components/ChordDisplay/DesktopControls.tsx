import React from 'react';
import { CardContent } from '../ui/card';
import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';
import KeyMenu from './components/KeyMenu';
import TextPreferencesMenu from './components/TextPreferencesMenu';
import { ChordSheetControlsProps } from './types';
import StickyBottomContainer from '../StickyBottomContainer';
import { useAtBottom } from '@/hooks/useAtBottom';

const DesktopControls: React.FC<ChordSheetControlsProps> = ({
  transpose,
  setTranspose,
  defaultTranspose = 0,
  songKey,
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
}) => {
  const isAtBottom = useAtBottom();

  return (
    <StickyBottomContainer isAtBottom={isAtBottom} desktopOnly>
      {/* Left: Play/Pause (Auto Scroll) button */}
      <div className='flex items-center'>
        <PlayButton
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          size={16}
          className={`h-8 w-full px-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-0 ${autoScroll && 'max-w-[2rem] bg-primary/10 text-primary hover:bg-primary/20'}`}
          variant="outline"
        />
        {/* Speed controls only show when playing, always between PlayButton and Transpose */}
        {autoScroll && (
          <div className="max-w-[7rem] ml-2 transition-all duration-300 animate-in slide-in-from-left-2">
            <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
          </div>
        )}
      </div>
      {/* Center: Key always centered and fixed */}
      <KeyMenu
        transpose={transpose}
        setTranspose={setTranspose}
        defaultTranspose={defaultTranspose}
        songKey={songKey}
      />
      {/* Right: Text Preferences */}
      <TextPreferencesMenu
        fontSize={fontSize} setFontSize={setFontSize}
        fontSpacing={fontSpacing} setFontSpacing={setFontSpacing}
        fontStyle={fontStyle} setFontStyle={setFontStyle}
        viewMode={viewMode} setViewMode={setViewMode}
      />
    </StickyBottomContainer>
  );
};

export default DesktopControls;