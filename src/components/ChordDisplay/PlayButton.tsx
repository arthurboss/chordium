import React from 'react';
import { Button } from '../ui/button';
import { Pause, Play } from 'lucide-react';

interface PlayButtonProps {
  autoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
  size?: number;
  className?: string;
  variant?: string;
  style?: React.CSSProperties;
}

const PlayButton: React.FC<PlayButtonProps> = ({ autoScroll, setAutoScroll, size = 22, className, variant = 'outline', style }) => (
  <Button 
    variant={variant as any} 
    size="icon" 
    className={(className || '') + ' flex items-center gap-2 px-3'}
    onClick={() => setAutoScroll(!autoScroll)}
    title={autoScroll ? "Stop Auto-Scroll" : "Start Auto-Scroll"}
    data-testid="auto-scroll-toggle"
    style={style}
  >
    {autoScroll ? <Pause size={size} /> : <Play size={size} />}
    {!autoScroll && <span className="font-medium text-sm hidden sm:inline">Auto Scroll</span>}
  </Button>
);

export default PlayButton; 