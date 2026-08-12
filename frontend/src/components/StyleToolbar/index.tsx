import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SteppedSlider } from "@/components/ui/stepped-slider";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import ToggleOption from "./ToggleOption";
import { TabsModeIcon, LyricsModeIcon } from "./ViewModeIcons";
import { TEXT_PREFERENCES_VALUES } from "./StyleToolbar.constants";
import type { TranslationStatus } from "@/hooks/useLyricsVersion";
import type { TranslationPhase } from "@/services/translation/get-translator";

interface StyleToolbarProps {
  fontSize: number;
  setFontSize: (value: number) => void;
  viewMode: string;
  setViewMode: (value: string) => void;
  hasTabs?: boolean;
  isLyricsMode?: boolean;
  hasTranslation?: boolean;
  showTranslation?: boolean;
  onToggleTranslation?: () => void;
  translationStatus?: TranslationStatus;
  translationProgress?: number;
  translationPhase?: TranslationPhase | null;
  onRequestTranslationSetup?: () => void;
  onRetryTranslation?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  translationDisplayMode?: "split-screen" | "single-screen";
  onTranslationDisplayModeChange?: (mode: "split-screen" | "single-screen") => void;
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
  translationStatus = "idle",
  translationProgress = 0,
  translationPhase = null,
  onRequestTranslationSetup,
  onRetryTranslation,
  isFullscreen = false,
  onToggleFullscreen,
  translationDisplayMode = "split-screen",
  onTranslationDisplayModeChange,
}) => {
  const { t } = useTranslation();

  const isWorking = translationStatus === "translating" && translationProgress > 0;
  const percent = Math.round(translationProgress * 100);
  const translationLabel = (() => {
    if (translationStatus === "needs-download") return t("lyrics.translationNeedsDownload");
    if (isWorking && translationPhase === "translate") {
      return t("lyrics.translatingProgress", { percent });
    }
    if (isWorking) return t("lyrics.downloadingModel", { percent });
    if (translationStatus === "translating") return t("lyrics.translating");
    if (translationStatus === "failed") return t("lyrics.translationFailed");
    if (translationStatus === "unavailable") return t("lyrics.translationUnavailable");
    return t("lyrics.translation");
  })();

  const handleTranslationClick = () => {
    switch (translationStatus) {
      case "needs-download":
        onRequestTranslationSetup?.();
        break;
      case "idle":
      case "translating":
        break;
      case "unavailable":
        toast.error(t("lyrics.translationUnavailable"));
        break;
      case "failed":
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
          {isLyricsMode && showTranslation ? (
            <div className="flex items-center gap-2">
              <ToggleOption
                active={translationDisplayMode === "split-screen"}
                disabled={false}
                onClick={() => onTranslationDisplayModeChange?.("split-screen")}
                icon={<span className="text-xs">⊕</span>}
                label={t("lyrics.splitScreen") || "Split"}
              />
              <ToggleOption
                active={translationDisplayMode === "single-screen"}
                disabled={false}
                onClick={() => onTranslationDisplayModeChange?.("single-screen")}
                icon={<span className="text-xs">−</span>}
                label={t("lyrics.singleScreen") || "Single"}
              />
            </div>
          ) : isLyricsMode ? (
            <div className="flex flex-col gap-1">
              <ToggleOption
                active={showTranslation && hasTranslation}
                disabled={translationStatus === "unnecessary"}
                onClick={handleTranslationClick}
                icon={<LyricsModeIcon className="opacity-70" />}
                label={translationLabel}
              />
              {isWorking && <Progress value={percent} className="h-1 w-full" />}
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
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StyleToolbar;
