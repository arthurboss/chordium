import React from 'react';
import { Slider } from '../ui/slider';

interface SpeedControlProps {
  autoScroll: boolean;
  scrollSpeed: number;
  setScrollSpeed: (v: number) => void;
  className?: string;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ autoScroll, scrollSpeed, setScrollSpeed, className }) => {
  return (
    <div className={"flex items-center " + (className || "") + ""} data-testid="scroll-speed-control">
      <span className="text-sm font-medium mr-2">Speed: {scrollSpeed}</span>
      <Slider
        value={[scrollSpeed]}
        min={1}
        max={10}
        step={1}
        onValueChange={(value) => setScrollSpeed(value[0])}
        className="w-32"
      />
    </div>
  );
};

export default SpeedControl; 