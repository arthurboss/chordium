import React from "react";
import { useTranslation } from "react-i18next";
import { SteppedSlider } from "@/components/ui/stepped-slider";
import ToggleOption from "./ToggleOption";
import { TabsModeIcon, LyricsModeIcon } from "./ViewModeIcons";
import { TEXT_PREFERENCES_VALUES } from "./StyleToolbar.constants";

interface StyleToolbarProps {
  fontSize: number;
  setFontSize: (value: number) => void;
  viewMode: string;
  setViewMode: (value: string) => void;
  /** Whether the displayed content has tab blocks; disables the Tabs toggle when false. */
  hasTabs?: boolean;
  /** Swaps the Tabs toggle for the translation toggle while lyrics are displayed. */
  isLyricsMode?: boolean;
  /** Whether a translation exists; disables the translation toggle when false. */
  hasTranslation?: boolean;
  showTranslation?: boolean;
  onToggleTranslation?: () => void;
}

const StyleToolbar: React.FC<StyleToolbarProps> = ({
  fontSize,
  setFontSize,
  viewMode,
  setViewMode,
  hasTabs = true,
  isLyricsMode = false,
  hasTranslation = false,
  showTranslation = false,
  onToggleTranslation,
}) => {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-2 min-w-0 text-xs">
      <div className="flex flex-wrap items-center justify-between w-full gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-medium">{t("textStyle.fontSize")}</span>
          <SteppedSlider
            value={[fontSize]}
            min={TEXT_PREFERENCES_VALUES.fontSizes.min}
            max={TEXT_PREFERENCES_VALUES.fontSizes.max}
            step={TEXT_PREFERENCES_VALUES.fontSizes.step}
            onValueChange={(value) => setFontSize(value[0])}
            className="w-24"
          />
          <span className="w-8 text-center">{fontSize}px</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isLyricsMode ? (
            <ToggleOption
              active={showTranslation}
              disabled={!hasTranslation}
              onClick={() => onToggleTranslation?.()}
              icon={<LyricsModeIcon className="opacity-70" />}
              label={t("lyrics.translation")}
            />
          ) : (
            <ToggleOption
              active={viewMode !== "tabs-off"}
              disabled={!hasTabs}
              onClick={() => setViewMode(viewMode === "tabs-off" ? "tabs-on" : "tabs-off")}
              icon={<TabsModeIcon className="opacity-70" />}
              label="Tabs"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleToolbar;
