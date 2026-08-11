import React, { useState } from "react";
import { Check, Download, Globe, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { BRFlag, DEFlag, ESFlag, USFlag } from "@/components/icons/flags";
import { useTranslationPacks } from "@/hooks/useTranslationPacks";
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

/**
 * Picks the language the app is shown in, and manages the per-language downloads
 * that let song lyrics be translated on the device. Both live together because
 * choosing a language is when the reader finds out lyrics can follow it.
 */
const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { statuses, progress, download, refresh } = useTranslationPacks();
  const [open, setOpen] = useState(false);
  const [promptedFor, setPromptedFor] = useState<TranslatableLanguage | null>(null);

  const current = i18n.resolvedLanguage;
  const CurrentFlag = FLAGS[current as TranslatableLanguage];

  const selectLanguage = (language: TranslatableLanguage) => {
    void i18n.changeLanguage(language);
    // Offer the download straight away when lyrics cannot yet follow the
    // language just chosen, rather than leaving it to be discovered in a song.
    setPromptedFor(statuses[language] === "downloadable" ? language : null);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void refresh();
        else setPromptedFor(null);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("language.switcher")}
          className="h-10 w-10 rounded-full p-0"
        >
          {CurrentFlag ? <CurrentFlag className="!h-9 !w-9" /> : <Globe className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 pt-4">
          <p className="text-sm font-medium">{t("language.appLanguage")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("language.packHint")}</p>
        </div>

        <ul className="p-2">
          {TRANSLATABLE_LANGUAGES.map((language) => {
            const Flag = FLAGS[language];
            const status = statuses[language];
            const isSelected = current === language;
            const percent = Math.round((progress[language] ?? 0) * 100);
            const name = t(NAME_KEYS[language]);

            return (
              <li key={language}>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-md pr-1",
                    isSelected && "bg-accent"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => selectLanguage(language)}
                    aria-current={isSelected}
                    className="flex flex-1 items-center gap-2 rounded-md p-2 text-left hover:bg-accent"
                  >
                    <Flag className="!h-6 !w-6" />
                    <span className={cn("text-sm", isSelected && "font-medium")}>{name}</span>
                  </button>

                  {status === "source" && (
                    <span className="px-1 text-xs text-muted-foreground">
                      {t("language.packSource")}
                    </span>
                  )}
                  {status === "installed" && (
                    <span className="px-1 text-muted-foreground" title={t("language.packReady")}>
                      <Check className="h-4 w-4" />
                      <span className="sr-only">{t("language.packReady")}</span>
                    </span>
                  )}
                  {status === "downloadable" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-8 w-8", promptedFor === language && "ring-1 ring-primary")}
                      aria-label={t("language.packDownloadFor", { language: name })}
                      onClick={() => download(language)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {status === "downloading" && (
                    <span className="flex items-center gap-1 px-1 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {percent}%
                    </span>
                  )}
                  {status === "unavailable" && (
                    <span className="px-1 text-xs text-muted-foreground">
                      {t("language.packUnavailable")}
                    </span>
                  )}
                </div>

                {status === "downloading" && (
                  <Progress value={percent} className="mx-2 mb-1 h-1" />
                )}
                {promptedFor === language && status === "downloadable" && (
                  <p className="px-2 pb-2 text-xs text-muted-foreground">
                    {t("language.packPrompt", { language: name })}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSwitcher;
