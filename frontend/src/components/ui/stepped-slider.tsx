import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SteppedSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showStepIndicators?: boolean;
}

const SteppedSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SteppedSliderProps
>(({ className, showStepIndicators = true, min = 0, max = 10, step = 1, value, onValueChange, ...props }, ref) => {
  const minNum = Number(min);
  const maxNum = Number(max);
  const stepNum = Number(step);
  const stepCount = Math.round((maxNum - minNum) / stepNum) + 1;

  const [currentValue, setCurrentValue] = React.useState<number>(
    value != null ? Number(value[0]) : minNum
  );

  React.useEffect(() => {
    if (value != null) setCurrentValue(Number(value[0]));
  }, [value]);

  const handleValueChange = (val: number[]) => {
    setCurrentValue(val[0]);
    onValueChange?.(val);
  };

  const thumbPct = ((currentValue - minNum) / (maxNum - minNum)) * 100;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "slider-track-glow relative flex w-full touch-none select-none items-center cursor-pointer",
        className
      )}
      min={min}
      max={max}
      step={step}
      value={value}
      onValueChange={handleValueChange}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-foreground/10 dark:bg-card dark:border dark:border-primary/30 hover:border-primary">
        <SliderPrimitive.Range className="absolute h-full bg-primary/50" />
      </SliderPrimitive.Track>
      {showStepIndicators && stepCount > 1 && (
        <div className="absolute top-1/2 left-0 right-0 pointer-events-none -translate-y-1/2">
          {Array.from({ length: stepCount }, (_, i) => {
            if (i === 0 || i === stepCount - 1) return null;
            const pct = (i / (stepCount - 1)) * 100;
            if (pct <= thumbPct) return null;
            return (
              <div
                key={i}
                className="absolute w-0.5 h-0.5 rounded-full bg-primary/20 -translate-x-1/2 top-1/2 -translate-y-1/2"
                style={{ left: `${pct}%` }}
              />
            );
          })}
        </div>
      )}
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-card dark:bg-foreground hover:bg-primary dark:hover:bg-white ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer" />
    </SliderPrimitive.Root>
  );
});

SteppedSlider.displayName = "SteppedSlider";

export { SteppedSlider };
