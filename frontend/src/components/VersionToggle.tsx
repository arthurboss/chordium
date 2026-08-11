import React from 'react';
import { Music, Guitar, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VersionToggleProps {
  version: 'simplified' | 'full' | 'lyrics';
  onVersionChange: (version: 'simplified' | 'full' | 'lyrics') => void;
  hasFullArrangement: boolean;
}

const VersionToggle: React.FC<VersionToggleProps> = ({
  version,
  onVersionChange,
  hasFullArrangement,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-full border p-0.5 text-sm">
        <button
          type="button"
          onClick={() => onVersionChange('lyrics')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors ${
            version === 'lyrics'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title={t("lyrics.lyrics")}
        >
          <BookOpen className="h-3.5 w-3.5" />
          {t("lyrics.lyrics")}
        </button>

        <button
          type="button"
          onClick={() => onVersionChange('simplified')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors ${
            version === 'simplified'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title={t("arrangementToggle.simplifiedTitle")}
        >
          <Music className="h-3.5 w-3.5" />
          {t("arrangementToggle.simplified")}
        </button>

        <button
          type="button"
          onClick={() => onVersionChange('full')}
          disabled={!hasFullArrangement}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors ${
            version === 'full'
              ? 'bg-primary text-primary-foreground'
              : hasFullArrangement
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-muted-foreground/50 cursor-not-allowed'
          }`}
          title={t("arrangementToggle.fullTitle")}
        >
          <Guitar className="h-3.5 w-3.5" />
          {t("arrangementToggle.full")}
        </button>
      </div>
    </div>
  );
};

export default VersionToggle;
