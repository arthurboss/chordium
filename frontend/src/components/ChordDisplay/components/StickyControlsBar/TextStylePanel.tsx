import React from "react";
import { useTranslation } from "react-i18next";
import { Slider } from "../../../ui/slider";
import ToggleOption from "./TextStyleMenu/ToggleOption";
import { TabsModeIcon, LyricsModeIcon } from "./TextStyleMenu/ViewModeIcons";
import { TEXT_PREFERENCES_VALUES } from "./TextStyleMenu/TextStyleMenu.constants";
import { isViewModeActive } from "./TextStyleMenu/TextStyleMenu.utils";

interface TextStylePanelProps {
  fontSize: number;
  setFontSize: (value: number) => void;
  viewMode: string;
  setViewMode: (value: string) => void;
  layout: "desktop" | "mobile";
}

const TextStylePanel: React.FC<TextStylePanelProps> = ({
  fontSize,
  setFontSize,
  viewMode,
  setViewMode,
  layout,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`w-full flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-200 ${
        layout === "desktop" ? "px-0 pb-3 border-b" : "px-1 mb-2"
      }`}
    >
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-muted-foreground">{t("textStyle.viewMode")}</span>
        <div className="flex flex-col gap-1">
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
      </div>
      <div className="w-px self-stretch bg-border" />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground">{t("textStyle.fontSize")}</span>
        <div className="flex items-center gap-2">
          <Slider
            value={[fontSize]}
            min={TEXT_PREFERENCES_VALUES.fontSizes.min}
            max={TEXT_PREFERENCES_VALUES.fontSizes.max}
            step={TEXT_PREFERENCES_VALUES.fontSizes.step}
            onValueChange={(value) => setFontSize(value[0])}
            className="w-32"
          />
          <span className="text-xs w-10 text-center text-muted-foreground">{fontSize}px</span>
        </div>
      </div>
    </div>
  );
};

export default TextStylePanel;
