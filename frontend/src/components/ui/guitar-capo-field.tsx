import React from "react";
import { Label } from "@/components/ui/label";
import { SteppedSlider } from "@/components/ui/stepped-slider";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface GuitarCapoFieldProps {
  id: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
}

// Helper function to convert number to ordinal form
const getOrdinalSuffix = (num: number): string => {
  if (num === 0) return '';
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
};

const GuitarCapoField: React.FC<GuitarCapoFieldProps> = ({
  id,
  label,
  value,
  onChange,
}) => {
  // Use a media query to detect mobile
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;

  return (
    <div className="space-y-2 min-h-[64px] flex flex-col justify-center">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {isMobile && (
            <span className="ml-2 text-sm text-muted-foreground">
              {value === 0 ? 'No capo' : (
                <>
                  <span>-</span>
                  <span className="text-primary font-bold"> {value}{getOrdinalSuffix(value)}</span>
                  <span> fret</span>
                </>
              )}
            </span>
          )}
        </Label>
      )}
      <div className="flex items-center gap-3 min-h-[40px]">
        <div className="flex-1">
          {isMobile ? (
            <Slider
              value={[value]}
              min={0}
              max={12}
              step={1}
              onValueChange={(sliderValue) => onChange(sliderValue[0])}
            />
          ) : (
            <Select value={String(value)} onValueChange={v => onChange(Number(v))}>
              <SelectTrigger id={id} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 13 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {i === 0 ? 'No capo' : (
                      <>
                        <span className="text-primary font-bold">{i}{getOrdinalSuffix(i)}</span>
                        <span> fret</span>
                      </>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuitarCapoField;
