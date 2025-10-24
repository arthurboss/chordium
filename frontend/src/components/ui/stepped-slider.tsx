
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SteppedSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  steps: number;
  showStepIndicators?: boolean;
  stepIndicatorColor?: string;
  trackHeight?: string;
}

const SteppedSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SteppedSliderProps
>(({ className, steps, showStepIndicators = true, stepIndicatorColor = "bg-gray-400", trackHeight = "h-14", min = 0, max = 10, value, onValueChange, ...props }, ref) => {
  const minNum = Number(min);
  const maxNum = Number(max);
  const step = steps > 1 ? (maxNum - minNum) / (steps - 1) : 1;

  // Get current capo position for highlighting
  const currentCapoPosition = value && value.length > 0 ? value[0] : 0;

  // Snap value to nearest step
  const handleValueChange = (val: number[]) => {
    if (steps > 1) {
      const snapped = val.map(v => {
        const s = Math.round((v - minNum) / step);
        const snappedValue = minNum + s * step;
        return Number(snappedValue.toFixed(6));
      });
      onValueChange?.(snapped);
    } else {
      onValueChange?.(val);
    }
  };

  return (
    <div className="relative">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center cursor-pointer z-10",
          className
        )}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={handleValueChange}
        {...props}
      >
        <SliderPrimitive.Track className={`${trackHeight} w-full grow overflow-hidden bg-transparent cursor-pointer`}>
          <SliderPrimitive.Range className="absolute h-full bg-primary/40 z-10" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer z-20" />
      </SliderPrimitive.Root>

      {/* Step Indicators */}
      {showStepIndicators && steps > 1 && (
        <div className="absolute top-1/2 left-0 right-0 flex justify-between pointer-events-none -translate-y-1/2 z-10">
          {Array.from({ length: steps }, (_, i) => (
            <div
              key={i}
              className={cn("w-1 h-1 rounded-full", stepIndicatorColor)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

SteppedSlider.displayName = "SteppedSlider";

export { SteppedSlider };
