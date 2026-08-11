import React from "react";
import { Check, Download, Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { BRFlag, DEFlag, ESFlag, USFlag } from "@/components/icons/flags";
import type { PackStatus } from "@/hooks/useTranslationPacks";
import { TRANSLATABLE_LANGUAGES, type TranslatableLanguage } from "@/services/translation/types";
import { cn } from "@/lib/utils";

const FLAGS: Record<TranslatableLanguage, React.FC<{ className?: string }>> = {
  en: USFlag,
  "pt-BR": BRFlag,
  es: ESFlag,
  de: DEFlag,
};

/** The locale files key Brazilian Portuguese without its region separator. */
const NAME_KEYS: Record<TranslatableLanguage, string> = {
  en: "language.en",
  "pt-BR": "language.ptBR",
  es: "language.es",
  de: "language.de",
};

interface LanguageListProps {
  selected?: string;
  statuses: Partial<Record<TranslatableLanguage, PackStatus>>;
  progress: Partial<Record<TranslatableLanguage, number>>;
  storedLanguages: TranslatableLanguage[];
  /** The language whose download is being pointed out, if any. */
  promptedFor: TranslatableLanguage | null;
  onSelect: (language: TranslatableLanguage) => void;
  onDownload: (language: TranslatableLanguage) => void;
  onRemove: (language: TranslatableLanguage) => void;
}

const LanguageList: React.FC<LanguageListProps> = ({
  selected,
  statuses,
  progress,
  storedLanguages,
  promptedFor,
  onSelect,
  onDownload,
  onRemove,
}) => {
  const { t } = useTranslation();

  return (
    <ul role="listbox" aria-label={t("language.appLanguage")}>
      {TRANSLATABLE_LANGUAGES.map((language) => {
        const Flag = FLAGS[language];
        const status = statuses[language];
        const isSelected = selected === language;
        const percent = Math.round((progress[language] ?? 0) * 100);
        const name = t(NAME_KEYS[language]);
        const hasStored = storedLanguages.includes(language);

        return (
          <li key={language}>
            <div
              role="option"
              aria-selected={isSelected}
              tabIndex={0}
              onClick={() => onSelect(language)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onSelect(language);
              }}
              className={cn(
                "relative flex cursor-pointer items-center gap-3 px-4 py-2.5 outline-none",
                "hover:bg-accent focus-visible:bg-accent",
                isSelected && "bg-accent"
              )}
            >
              {/* While a language downloads, its own row fills up rather than
                  carrying a separate bar. */}
              {status === "downloading" && (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-primary/25 transition-[width] duration-200"
                  style={{ width: `${percent}%` }}
                />
              )}

              <span className="relative z-10 flex flex-1 items-center gap-3">
                <Flag className="!h-6 !w-6 shrink-0" />
                <span className={cn("flex-1 text-sm", isSelected && "font-medium")}>{name}</span>

                {status === "downloadable" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 shrink-0",
                      promptedFor === language && "ring-1 ring-primary"
                    )}
                    aria-label={t("language.packDownloadFor", { language: name })}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDownload(language);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}

                {status === "downloading" && (
                  <span className="flex shrink-0 items-center gap-1 pr-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {percent}%
                  </span>
                )}

                {status === "installed" && hasStored && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={t("language.removeStoredFor", { language: name })}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(language);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                {status === "installed" && !hasStored && (
                  <span className="shrink-0 pr-2 text-muted-foreground" title={t("language.packReady")}>
                    <Check className="h-4 w-4" />
                    <span className="sr-only">{t("language.packReady")}</span>
                  </span>
                )}

                {status === "unavailable" && (
                  <span className="shrink-0 pr-2 text-xs text-muted-foreground">
                    {t("language.packUnavailable")}
                  </span>
                )}
              </span>
            </div>

            {promptedFor === language && status === "downloadable" && (
              <p className="px-4 pb-2 text-xs text-muted-foreground">
                {t("language.packPrompt", { language: name })}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default LanguageList;
export { NAME_KEYS, FLAGS };
