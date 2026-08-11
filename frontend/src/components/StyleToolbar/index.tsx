import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SteppedSlider } from "@/components/ui/stepped-slider";
import { Progress } from "@/components/ui/progress";
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
  onRetryTranslation?: () => void;
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
  onRetryTranslation,
}) => {
  const { t } = useTranslation();

  // The toggle doubles as the place where a translation reports on itself, so
  // its label explains what it is waiting for instead of sitting there greyed
  // out with no reason given.
  const isDownloading = translationStatus === 'translating' && translationProgress > 0;
  const percent = Math.round(translationProgress * 100);
  const translationLabel = (() => {
    if (translationStatus === 'needs-consent') return t("lyrics.enableTranslation");
    if (isDownloading) return t("lyrics.downloadingModel", { percent });
    if (translationStatus === 'translating') return t("lyrics.translating");
    if (translationStatus === 'failed') return t("lyrics.translationFailed");
    if (translationStatus === 'unavailable') return t("lyrics.translationUnavailable");
    return t("lyrics.translation");
  })();

  // Pressing the toggle before a translation exists says what is going on
  // rather than doing nothing, since the words cannot be shown yet.
  const handleTranslationClick = () => {
    switch (translationStatus) {
      case 'needs-consent':
        onAcceptTranslationDownload?.();
        break;
      case 'idle':
      case 'translating':
        toast.info(t("lyrics.translationPreparing"));
        break;
      case 'unavailable':
        toast.error(t("lyrics.translationUnavailable"));
        break;
      case 'failed':
        toast.info(t("lyrics.translationRetry"));
        onRetryTranslation?.();
        break;
      default:
        onToggleTranslation?.();
    }
  };

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
            <div className="flex flex-col gap-1">
              <ToggleOption
                active={showTranslation && hasTranslation}
                disabled={translationStatus === 'unnecessary'}
                onClick={handleTranslationClick}
                icon={<LyricsModeIcon className="opacity-70" />}
                label={translationLabel}
              />
              {isDownloading && <Progress value={percent} className="h-1 w-full" />}
            </div>
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
