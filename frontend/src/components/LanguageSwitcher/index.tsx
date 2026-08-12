import React, { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslationPacks } from "@/hooks/useTranslationPacks";
import type { TranslatableLanguage } from "@/services/translation/types";
import LanguageList, { FLAGS, NAME_KEYS } from "./LanguageList";

/** Asked at most once per visit, so a declined offer is not pushed again. */
const PROMPT_FLAG = "chordium-language-pack-prompted";

/**
 * Picks the language the app is shown in, and manages what each language needs
 * before lyrics can be translated into it. Both live together because choosing a
 * language is when the reader finds out lyrics can follow it.
 */
const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const { statuses, progress, download, canRemove, remove, sizeMbFor, refresh } =
    useTranslationPacks();
  const [open, setOpen] = useState(false);
  const [promptedFor, setPromptedFor] = useState<TranslatableLanguage | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<TranslatableLanguage | null>(null);
  const hasOfferedRef = useRef(false);

  const current = i18n.resolvedLanguage;
  const CurrentFlag = FLAGS[current as TranslatableLanguage];

  // Someone reading in a language whose lyrics cannot be translated yet would
  // otherwise only find out inside a song, so the offer is made up front.
  useEffect(() => {
    if (hasOfferedRef.current || sessionStorage.getItem(PROMPT_FLAG)) return;
    const language = current as TranslatableLanguage;
    if (statuses[language] !== "downloadable") return;
    hasOfferedRef.current = true;
    sessionStorage.setItem(PROMPT_FLAG, "1");
    setPromptedFor(language);
    setOpen(true);
  }, [current, statuses]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) void refresh();
    else setPromptedFor(null);
  };

  const selectLanguage = (language: TranslatableLanguage) => {
    void i18n.changeLanguage(language);
    // Offer the download straight away when lyrics cannot yet follow the
    // language just chosen, rather than leaving it to be discovered in a song.
    setPromptedFor(statuses[language] === "downloadable" ? language : null);
  };

  const list = (
    <LanguageList
      selected={current}
      statuses={statuses}
      progress={progress}
      promptedFor={promptedFor}
      onSelect={selectLanguage}
      onDownload={download}
      onRemove={canRemove ? setPendingRemoval : undefined}
      sizeMbFor={sizeMbFor}
    />
  );

  const trigger = (
    <Button
      variant="outline"
      size="icon"
      aria-label={t("language.switcher")}
      className="h-10 w-10 rounded-full p-0"
    >
      {CurrentFlag ? <CurrentFlag className="!h-9 !w-9" /> : <Globe className="h-4 w-4" />}
    </Button>
  );

  const hint = <p className="px-4 pb-3 text-xs text-muted-foreground">{t("language.packHint")}</p>;

  const removalName = pendingRemoval ? t(NAME_KEYS[pendingRemoval]) : "";
  const removalSize = pendingRemoval ? sizeMbFor(pendingRemoval) : 0;

  return (
    <>
      {isMobile ? (
        // On phones this is a bottom sheet: it opens next to the thumb and can
        // use the full width, which an anchored popover cannot.
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent
            side="bottom"
            className="flex max-h-[92dvh] flex-col gap-0 rounded-t-xl px-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
          >
            <SheetHeader className="shrink-0 px-4 text-left">
              <SheetTitle>{t("language.appLanguage")}</SheetTitle>
              <SheetDescription className="sr-only">{t("language.packHint")}</SheetDescription>
            </SheetHeader>
            {hint}
            <div className="min-h-0 overflow-y-auto overscroll-contain">{list}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent align="end" className="w-80 overflow-hidden p-0">
            <p className="px-4 pt-4 text-sm font-medium">{t("language.appLanguage")}</p>
            {hint}
            {list}
          </PopoverContent>
        </Popover>
      )}

      <AlertDialog
        open={pendingRemoval !== null}
        onOpenChange={(next) => !next && setPendingRemoval(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("language.removeTitle", { language: removalName })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("language.removeBody", { language: removalName, size: removalSize })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("language.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingRemoval) void remove(pendingRemoval);
                setPendingRemoval(null);
              }}
            >
              {t("language.removeConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LanguageSwitcher;
