
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ChordDiagram from '@/components/ChordDiagram';

export const useChordRenderer = () => {
  const isMobile = useIsMobile();
  
  // Render a chord with tooltip or popover based on device type
  const renderChord = (chord: string) => {
    const chordName = chord.trim();
    
    if (isMobile) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <span className="chord cursor-pointer">
              {chordName}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 bg-background border-2 border-chord shadow-lg">
            <div className="font-comic">
              <ChordDiagram chordName={chordName} />
            </div>
          </PopoverContent>
        </Popover>
      );
    } else {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="chord cursor-pointer">
                {chordName}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="p-4 bg-background border-2 border-chord shadow-lg">
              <div className="font-comic">
                <ChordDiagram chordName={chordName} />
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  };

  return { renderChord };
};
