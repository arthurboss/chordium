
import React from 'react';
import { Slider } from '../ui/slider';

interface SpeedControlProps {
  autoScroll: boolean;
  scrollSpeed: number;
  setScrollSpeed: (v: number) => void;
  className?: string;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ autoScroll, scrollSpeed, setScrollSpeed, className }) => {
  if (!autoScroll) return null;
  
  return (
    <div className={`flex items-center ${className || ""}`} style={{ cursor: 'pointer' }}>
      <Slider
        value={[scrollSpeed]}
        min={1}
        max={10}
        step={1}
        onValueChange={(value) => setScrollSpeed(value[0])}
        className="w-28 sm:w-32"
      />
      <span className="text-sm font-medium ml-2">x{scrollSpeed}</span>
    </div>
  );
};

export default SpeedControl;
