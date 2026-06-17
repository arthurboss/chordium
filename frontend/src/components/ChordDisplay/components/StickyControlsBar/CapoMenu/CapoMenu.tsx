import React from "react";
import { useTranslation } from "react-i18next";
import { SteppedSlider } from "@/components/ui/stepped-slider";
import type { CapoMenuProps } from "./CapoMenu.types";

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
      <span className="w-4 text-center text-primary">{capo}</span>
    </div>
  );
};

export default CapoMenu;
