import React from 'react';
import PlayButton from '../../PlayButton';
import SpeedControl from '../../SpeedControl';
import type { AutoScrollControlsProps } from './AutoScrollControls.types';

/**
 * AutoScrollControls component for managing auto-scroll functionality
 * Provides play/pause button and speed control
 * 
 * @param autoScroll - Current auto-scroll state
 * @param setAutoScroll - Function to update auto-scroll state
 * @param scrollSpeed - Current scroll speed
 * @param setScrollSpeed - Function to update scroll speed
 * @param title - Title text to display above the controls
 */
const AutoScrollControls: React.FC<AutoScrollControlsProps> = ({
  autoScroll,
  setAutoScroll,
  scrollSpeed,
  setScrollSpeed,
  title = "Auto Scroll",
}) => {
  return (
    <div className='flex flex-col items-start gap-1'>
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className='flex items-center'>
        <PlayButton
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          size={16}
          className={`h-8 w-full px-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-0 ${autoScroll && 'max-w-[2rem] bg-primary/10 text-primary hover:bg-primary/20'}`}
        />
        {/* Speed controls only show when playing, always between PlayButton and Transpose */}
        {autoScroll && (
          <div className="w-32 sm:w-20 md:w-32 ml-2 transition-all duration-300 animate-in slide-in-from-left-2">
            <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoScrollControls;
