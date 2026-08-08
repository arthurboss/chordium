import React from 'react';
import { Music, Guitar, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ArrangementLyricsToggleProps {
  hasFullArrangement: boolean;
  showFull: boolean;
  onToggleArrangement: (showFull: boolean) => void;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
}

const ArrangementLyricsToggle: React.FC<ArrangementLyricsToggleProps> = ({
  hasFullArrangement,
  showFull,
  onToggleArrangement,
  viewMode,
  onViewModeChange,
}) => {
  const { t } = useTranslation();
  const isLyricsOnly = viewMode === 'lyrics-only';

  if (!hasFullArrangement && !isLyricsOnly) {
    return null;
  }

  return (
    <div className="flex justify-center gap-2">
      {hasFullArrangement && (
        <div className="inline-flex rounded-full border p-0.5 text-sm">
          <button
            type="button"
            onClick={() => onToggleArrangement(false)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors ${!showFull ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title={t("arrangementToggle.simplifiedTitle")}
          >
            <Music className="h-3.5 w-3.5" />
            {t("arrangementToggle.simplified")}
          </button>
          <button
            type="button"
            onClick={() => onToggleArrangement(true)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors ${showFull ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title={t("arrangementToggle.fullTitle")}
          >
            <Guitar className="h-3.5 w-3.5" />
            {t("arrangementToggle.full")}
          </button>
        </div>
      )}

      {isLyricsOnly && (
        <div className="inline-flex rounded-full border p-0.5 text-sm">
          <button
            type="button"
            onClick={() => onViewModeChange('tabs-on')}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors text-muted-foreground hover:text-foreground"
            title={t("viewMode.chords")}
          >
            <Music className="h-3.5 w-3.5" />
            {t("viewMode.chords")}
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('lyrics-only')}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors bg-primary text-primary-foreground"
            title={t("viewMode.lyricsOnly")}
          >
            <BookOpen className="h-3.5 w-3.5" />
            {t("viewMode.lyricsOnly")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ArrangementLyricsToggle;
