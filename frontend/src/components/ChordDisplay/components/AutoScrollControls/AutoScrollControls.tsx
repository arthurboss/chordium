import React from 'react';
import PlayButton from '../StickyControlsBar/PlayButton';
import SpeedControl from '../StickyControlsBar/SpeedControl';
import type { AutoScrollControlsProps } from './AutoScrollControls.types';

const AutoScrollControls: React.FC<AutoScrollControlsProps> = ({
  autoScroll,
  setAutoScroll,
  scrollSpeed,
  setScrollSpeed,
}) => {
  return (
    <div className='flex items-center'>
      <PlayButton
        autoScroll={autoScroll}
        setAutoScroll={setAutoScroll}
        size={16}
        className={`h-10 w-10 rounded-full transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-0 hover:text-primary ${autoScroll ? 'text-primary' : ''}`}
      />
      {autoScroll && (
        <div className="w-32 ml-3 transition-all duration-300 animate-in slide-in-from-left-2">
          <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
        </div>
      )}
    </div>
  );
};

export default AutoScrollControls;
