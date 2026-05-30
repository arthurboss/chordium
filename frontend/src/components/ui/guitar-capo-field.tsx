import React from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface GuitarCapoFieldProps {
  id: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
}

const GuitarCapoField: React.FC<GuitarCapoFieldProps> = ({ id, label, value, onChange }) => {
  const { t } = useTranslation();
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

  const capoLabel = (fret: number) =>
    fret === 0 ? t("guitarCapoField.noCapo") : t("guitarCapoField.fretDisplay", { ordinal: fret });

  return (
    <div className="space-y-2 min-h-[64px] flex flex-col justify-center">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {isMobile && value !== 0 && (
            <span className="ml-2 text-sm text-primary font-bold">
              {capoLabel(value)}
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
            <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
              <SelectTrigger id={id} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 13 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {capoLabel(i)}
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
