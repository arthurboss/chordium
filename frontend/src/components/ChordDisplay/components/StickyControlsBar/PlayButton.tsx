import React from 'react';
import { Button } from '../../../ui/button';
import { Pause, Play } from 'lucide-react';

interface PlayButtonProps {
  autoScroll: boolean;
  // New signature: optional enable flag and optional startFromChordDisplay flag
  toggleAutoScroll: (enable?: boolean, startFromChordDisplay?: boolean) => void;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const PlayButton: React.FC<PlayButtonProps> = ({ autoScroll, toggleAutoScroll, size = 22, className = '', style }) => {

  return (
    <Button
      variant="outline"
      size="icon"
      className={`flex items-center ${className}`}
      onClick={() => toggleAutoScroll(undefined, false)}
      title={autoScroll ? "Stop Auto-Scroll" : "Start Auto-Scroll"}
      style={style}
    >
      {autoScroll ? (<Pause size={size} className="text-foreground" />) : (
        <div className='flex items-center gap-2'>
          <Play size={size} className="text-foreground" />
        </div>)
      }
    </Button>
  );
};

export default PlayButton; 