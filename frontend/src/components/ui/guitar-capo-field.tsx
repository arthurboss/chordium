import React from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { SteppedSlider } from "@/components/ui/stepped-slider";

interface GuitarCapoFieldProps {
  id: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
}

const enSuffix = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
};

const CapoLabel: React.FC<{ capo: number; lang: string }> = ({ capo, lang }) => {
  if (capo === 0) return <span>—</span>;
  if (lang === "pt-BR") return <span>{capo}<sup>ª</sup></span>;
  if (lang === "es") return <span>{capo}<sup>º</sup></span>;
  return <span>{capo}<sup>{enSuffix(capo)}</sup></span>;
};

const GuitarCapoField: React.FC<GuitarCapoFieldProps> = ({ id, label, value, onChange }) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="flex items-center gap-3">
        <SteppedSlider
          value={[value]}
          min={0}
          max={12}
          step={1}
          onValueChange={(v) => onChange(v[0])}
          className="flex-1"
        />
        <span className="w-6 text-sm text-muted-foreground">
          <CapoLabel capo={value} lang={i18n.language} />
        </span>
      </div>
    </div>
  );
};

export default GuitarCapoField;
