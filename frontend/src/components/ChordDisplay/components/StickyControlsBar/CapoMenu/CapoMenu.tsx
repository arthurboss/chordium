import React from "react";
import { useTranslation } from "react-i18next";
import { SteppedSlider } from "@/components/ui/stepped-slider";
import type { CapoMenuProps } from "./CapoMenu.types";

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

const CapoMenu: React.FC<CapoMenuProps> = ({
  capo,
  setCapo,
  defaultCapo = 0,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <SteppedSlider
        value={[capo]}
        min={0}
        max={11}
        step={1}
        onValueChange={(value) => setCapo(value[0])}
        className="w-24"
        title={t("stickyControlsBar.capoPosition")}
      />
      <span className="w-6 text-sm">
        <CapoLabel capo={capo} lang={i18n.language} />
      </span>
    </div>
  );
};

export default CapoMenu;
