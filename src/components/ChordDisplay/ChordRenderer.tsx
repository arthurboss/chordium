import React from 'react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import ChordDiagram from '../ChordDiagram';
import { ChordRendererProps } from './types';

/**
 * Renders a chord with tooltip or popover based on device type
 * Uses Popover for mobile devices and Tooltip for desktop
 */
const ChordRenderer: React.FC<ChordRendererProps> = ({ chordName, isMobile }) => {
  // Shared styling for the chord display
  const chordStyle = "chord cursor-pointer font-medium text-chord hover:text-chord-hover transition-colors duration-150 border-b border-dotted border-chord-muted hover:border-chord";
  
  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <span className={chordStyle}>
            {chordName}
          </span>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-4 bg-background border-2 border-chord shadow-lg"
          sideOffset={5}
          align="center"
          side="top"
        >
          <div className="font-comic">
            <ChordDiagram chordName={chordName} />
          </div>
        </PopoverContent>
      </Popover>
    );
  } 
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={chordStyle}>
            {chordName}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="p-4 bg-background border-2 border-chord shadow-lg"
          sideOffset={5}
          align="center"
        >
          <div className="font-comic">
            <ChordDiagram chordName={chordName} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default React.memo(ChordRenderer);
