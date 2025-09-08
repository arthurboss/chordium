import React from 'react';
import { Button } from '../../../ui/button';
import { Pause, Play } from 'lucide-react';

interface PlayButtonProps {
  autoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const PlayButton: React.FC<PlayButtonProps> = ({ autoScroll, setAutoScroll, size = 22, className, style }) => (
  <Button 
    variant="outline"
    size="icon" 
    className={(className || '') + ' flex items-center gap-2 px-2'}
    onClick={() => setAutoScroll(!autoScroll)}
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

export default PlayButton; 