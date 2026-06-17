import React from "react";
import { useTranslation } from "react-i18next";
import { SteppedSlider } from "@/components/ui/stepped-slider";
import ToggleOption from "./ToggleOption";
import { TabsModeIcon, LyricsModeIcon } from "./ViewModeIcons";
import { TEXT_PREFERENCES_VALUES } from "./StyleToolbar.constants";
import { isViewModeActive } from "./StyleToolbar.utils";

interface StyleToolbarProps {
  fontSize: number;
  setFontSize: (value: number) => void;
  viewMode: string;
  setViewMode: (value: string) => void;
}

const StyleToolbar: React.FC<StyleToolbarProps> = ({
  fontSize,
  setFontSize,
  viewMode,
  setViewMode,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1 px-4 py-2 min-w-0 text-xs items-start">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <ToggleOption
            active={viewMode !== "tabs-off" && viewMode !== "lyrics-only"}
            onClick={() => {
              if (viewMode === "lyrics-only") setViewMode("tabs-on");
              else setViewMode(viewMode === "tabs-off" ? "tabs-on" : "tabs-off");
            }}
            icon={<TabsModeIcon className="opacity-70" />}
            label="Tabs"
          />
          <ToggleOption
            active={isViewModeActive(viewMode, "lyrics-only")}
            onClick={() => {
              if (viewMode === "lyrics-only") setViewMode("tabs-on");
              else setViewMode("lyrics-only");
            }}
            icon={<LyricsModeIcon className="opacity-70" />}
            label={t("textStyle.lyrics")}
          />
        </div>
        <div className="w-px self-stretch bg-border" />
        <div className="flex items-center gap-2">
          <span className="font-medium">{t("textStyle.fontSize")}</span>
          <SteppedSlider
            value={[fontSize]}
            min={TEXT_PREFERENCES_VALUES.fontSizes.min}
            max={TEXT_PREFERENCES_VALUES.fontSizes.max}
            step={TEXT_PREFERENCES_VALUES.fontSizes.step}
            onValueChange={(value) => setFontSize(value[0])}
            className="w-24"
          />
          <span className="w-8 text-center text-primary">{fontSize}px</span>
        </div>
      </div>
    </div>
  );
};

export default StyleToolbar;
