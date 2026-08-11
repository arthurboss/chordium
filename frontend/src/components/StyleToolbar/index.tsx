import React from "react";
import { useTranslation } from "react-i18next";
import { SteppedSlider } from "@/components/ui/stepped-slider";
import ToggleOption from "./ToggleOption";
import { TabsModeIcon, LyricsModeIcon } from "./ViewModeIcons";
import { TEXT_PREFERENCES_VALUES } from "./StyleToolbar.constants";
import type { TranslationStatus } from "@/hooks/useLyricsVersion";

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
  /** Progress of the translation, so the toggle can explain why it is not ready. */
  translationStatus?: TranslationStatus;
  /** Share of the translation model downloaded so far, from 0 to 1. */
  translationProgress?: number;
  onAcceptTranslationDownload?: () => void;
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
  translationStatus = 'idle',
  translationProgress = 0,
  onAcceptTranslationDownload,
}) => {
  const { t } = useTranslation();

  // The toggle doubles as the place where a translation reports on itself, so
  // its label explains what it is waiting for instead of sitting there greyed
  // out with no reason given.
  const isDownloading = translationStatus === 'translating' && translationProgress > 0;
  const translationLabel = (() => {
    if (translationStatus === 'needs-consent') return t("lyrics.enableTranslation");
    if (isDownloading) return t("lyrics.downloadingModel", { percent: Math.round(translationProgress * 100) });
    if (translationStatus === 'translating') return t("lyrics.translating");
    if (translationStatus === 'failed') return t("lyrics.translationFailed");
    return t("lyrics.translation");
  })();

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
              disabled={!hasTranslation && translationStatus !== 'needs-consent'}
              onClick={() =>
                translationStatus === 'needs-consent'
                  ? onAcceptTranslationDownload?.()
                  : onToggleTranslation?.()
              }
              icon={<LyricsModeIcon className="opacity-70" />}
              label={translationLabel}
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
