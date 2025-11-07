import React from 'react';
import { Slider } from '../../../ui/slider';

interface SpeedControlProps {
  autoScroll: boolean;
  scrollSpeed: number;
  setScrollSpeed: (v: number) => void;
  className?: string;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ autoScroll, scrollSpeed, setScrollSpeed, className }) => {
  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent parent click handlers from being triggered when interacting with the slider
    e.stopPropagation();
    // Helpful debug logging when diagnosing unexpected toggles
    console.log('SpeedControl: pointerdown', { scrollSpeed });
  };

  const handleValueChange = (value: number[]) => {
    console.log('SpeedControl: onValueChange', value[0]);
    setScrollSpeed(value[0]);
  };

  return (
    <div
      role="none"
      tabIndex={-1}
      className={"flex items-center " + (className || "") + ""}
      style={{ cursor: 'pointer' }}
      onPointerDown={handlePointerDown}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Slider
        value={[scrollSpeed]}
        min={1}
        max={10}
        step={1}
        onValueChange={handleValueChange}
        className="flex-1 min-w-32 sm:min-w-8"
      />
      <span className="text-sm font-medium ml-2">x{scrollSpeed}</span>
    </div>
  );
};

export default SpeedControl; 