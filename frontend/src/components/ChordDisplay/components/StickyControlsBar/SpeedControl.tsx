import React from "react";
import { SteppedSlider } from "@/components/ui/stepped-slider";

interface SpeedControlProps {
  scrollSpeed: number;
  setScrollSpeed: (v: number) => void;
  className?: string;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ scrollSpeed, setScrollSpeed, className }) => {
  return (
    <div className={"flex items-center cursor-pointer " + (className || "")}>
      <SteppedSlider
        value={[scrollSpeed]}
        min={1}
        max={10}
        step={1}
        onValueChange={(value) => setScrollSpeed(value[0])}
        className="flex-1 w-32"
      />
      <span className="text-sm font-medium ml-2">x{scrollSpeed}</span>
    </div>
  );
};

export default SpeedControl;
