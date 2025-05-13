import React, { useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ChordDiagram from '@/components/ChordDiagram';

/**
 * Chord component that renders with tooltip or popover based on device type
 * @param props - Component props with chord name
 * @returns JSX element with chord and its diagram
 */
export const ChordWithTooltip: React.FC<{ chord: string }> = ({ chord }) => {
  const chordName = chord.trim();
  // Use the optimized useIsMobile hook
  const isMobile = useIsMobile();
  
  // Use useMemo to prevent unnecessary re-rendering of components
  return useMemo(() => {
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
  }, [isMobile, chordName]); // Only re-render when these values change
};
