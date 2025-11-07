import React from 'react';
import PlayButton from '../StickyControlsBar/PlayButton';
import SpeedControl from '../StickyControlsBar/SpeedControl';
import type { AutoScrollControlsProps } from './AutoScrollControls.types';

/**
 * AutoScrollControls component for managing auto-scroll functionality
 * Provides play/pause button and speed control
 * 
 * @param autoScroll - Current auto-scroll state
 * @param toggleAutoScroll - Function to toggle auto-scroll state
 * @param scrollSpeed - Current scroll speed
 * @param setScrollSpeed - Function to update scroll speed
 * @param title - Title text to display above the controls
 */
const AutoScrollControls: React.FC<AutoScrollControlsProps> = ({
  autoScroll,
  toggleAutoScroll,
  scrollSpeed,
  setScrollSpeed,
  title = "Scroll",
}) => {
  return (
    <div className='flex flex-col items-start gap-1'>
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className='flex items-center'>
        <PlayButton
          autoScroll={autoScroll}
          toggleAutoScroll={toggleAutoScroll}
          size={16}
          // Use w-auto so the button doesn't expand to cover the slider area and
          // intercept clicks intended for the speed control.
          className={`h-8 w-auto px-2 transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-0 hover:text-primary ${autoScroll ? 'text-primary' : ''}`}
        />
        {/* Speed controls only show when playing, always between PlayButton and Transpose */}
        {autoScroll && (
          <div className="w-32 ml-3 transition-all duration-300 animate-in slide-in-from-left-2">
            <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoScrollControls;
