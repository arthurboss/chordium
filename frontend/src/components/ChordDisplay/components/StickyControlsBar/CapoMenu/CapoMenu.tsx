import React from "react";
import { useTranslation } from "react-i18next";
import { SteppedSlider } from "@/components/ui/stepped-slider";
import type { CapoMenuProps } from "./CapoMenu.types";

const ordinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
};

const CapoMenu: React.FC<CapoMenuProps> = ({
  capo,
  setCapo,
  defaultCapo = 0,
}) => {
  const { t } = useTranslation();

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
      <span className="w-8 text-primary">{capo === 0 ? "—" : ordinal(capo)}</span>
    </div>
  );
};

export default CapoMenu;
