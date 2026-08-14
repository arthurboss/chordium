import React, { useEffect, useState } from "react";
import { Download, Globe, Mic, Trash2, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useTranslationPacks } from "@/hooks/useTranslationPacks";
import { onLanguageManagerRequested } from "@/services/translation/language-manager";
import { onVoiceSetupRequested } from "@/services/speech/speech-manager";
import { useSpeechModel } from "@/hooks/useSpeechModel";
import type { TranslatableLanguage } from "@/services/translation/types";
import LanguageList, { FLAGS } from "./LanguageList";

/**
 * Picks the language the app is shown in, and manages whatever the device needs
 * before lyrics can be translated. Both live together because choosing a
 * language is when the reader finds out lyrics can follow it.
 */
const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const {
    backend,
    statuses,
    progress,
    download,
    modelStatus,
    modelProgress,
    modelSizeMb,
    downloadModel,
    cancelModelDownload,
    removeModel,
    refresh,
  } = useTranslationPacks();
  const speech = useSpeechModel();
  const [open, setOpen] = useState(false);
  const [promptedFor, setPromptedFor] = useState<TranslatableLanguage | null>(null);
  // The language a waiting song is sung in, kept so its own pair is the one
  // fetched rather than the stand-in route used when nobody asked.
  const [pendingSource, setPendingSource] = useState<string | null>(null);
  const [confirmingModelRemoval, setConfirmingModelRemoval] = useState(false);
  const [confirmingSpeechRemoval, setConfirmingSpeechRemoval] = useState(false);
  // Pointed out when the reader was sent here by pressing the microphone.
  const [promptedForVoice, setPromptedForVoice] = useState(false);

  const current = i18n.resolvedLanguage;
  const CurrentFlag = FLAGS[current as TranslatableLanguage];

  // The panel opens when it is asked for, and not otherwise: a song waiting on a
  // download sends the reader here, which is the point at which the download
  // means anything to them.
  useEffect(
    () =>
      onLanguageManagerRequested(({ source }) => {
        setPendingSource(source ?? null);
        setPromptedFor((i18n.resolvedLanguage as TranslatableLanguage) ?? null);
        setOpen(true);
        void refresh();
      }),
    [i18n, refresh]
  );

  useEffect(
    () =>
      onVoiceSetupRequested(() => {
        setPromptedForVoice(true);
        setOpen(true);
        void speech.refresh();
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) void refresh();
    else {
      setPromptedFor(null);
      setPendingSource(null);
      setPromptedForVoice(false);
    }
  };

  // Picking a language is the whole point of the panel, so it closes once one is
  // chosen. Downloading is not: that leaves it open, since the reader is likely
  // to watch it.
  const selectLanguage = (language: TranslatableLanguage) => {
    void i18n.changeLanguage(language);
    setPromptedFor(null);
    setOpen(false);
  };

  // Only the language a song is actually waiting on is fetched by its own route;
  // any other row is a plain choice with no particular song behind it.
  const handleDownload = (language: TranslatableLanguage) => {
    download(language, language === promptedFor ? pendingSource ?? undefined : undefined);
  };

  const list = (
    <LanguageList
      selected={current}
      statuses={statuses}
      progress={progress}
      promptedFor={promptedFor}
      onSelect={selectLanguage}
      onDownload={handleDownload}
      perLanguageDownloads={backend === "chrome"}
    />
  );

  // Browsers without a translator of their own use one model for every language,
  // so it is offered once here instead of language by language. It is also the
  // one download the app itself stores, and so the only one it can remove.
  const modelPercent = Math.round(modelProgress * 100);
  const modelSection = backend === "local-model" && (
    <div className="border-t px-4 py-3">
      <p className="text-sm font-medium">{t("language.modelHeading")}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {modelStatus === "present"
          ? t("language.modelHintDownloaded", { size: modelSizeMb })
          : t("language.modelHint", { size: modelSizeMb })}
      </p>

      {/* One button carries the whole state: it starts the download, then fills
          with its progress and offers to stop, then offers to remove it. */}
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "relative mt-2 w-full overflow-hidden",
          // Pointed out when the reader was sent here by something waiting on it.
          promptedFor && modelStatus === "absent" && "ring-1 ring-primary"
        )}
        onClick={() => {
          if (modelStatus === "downloading") cancelModelDownload();
          else if (modelStatus === "present") setConfirmingModelRemoval(true);
          else downloadModel();
        }}
      >
        {modelStatus === "downloading" && (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 bg-primary/25 transition-[width] duration-200"
            style={{ width: `${modelPercent}%` }}
          />
        )}
        <span className="relative z-10 flex items-center">
          {modelStatus === "downloading" ? (
            <>
              <X className="mr-2 h-4 w-4" />
              {t("language.modelCancel", { percent: modelPercent })}
            </>
          ) : modelStatus === "present" ? (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              {t("language.modelDelete")}
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {t("language.modelDownload")}
            </>
          )}
        </span>
      </Button>
    </div>
  );

  // Hearing a spoken search needs either the browser's own recogniser, which is
  // ready wherever it exists, or the app's model for browsers without one. Both are
  // reported here so the one place that manages languages manages this too, which is
  // also where the microphone sends a reader who still needs the download.
  const speechPercent = Math.round(speech.progress * 100);
  const speechSection = speech.backend !== "none" && (
    <div className="border-t px-4 py-3">
      <p className="flex items-center gap-1.5 text-sm font-medium">
        <Mic className="h-3.5 w-3.5" />
        {t("voiceSearch.heading")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {speech.backend === "native"
          ? t("voiceSearch.hintNative")
          : speech.status === "present"
            ? t("voiceSearch.hintReady", { size: speech.sizeMb })
            : t("voiceSearch.hint", { size: speech.sizeMb })}
      </p>

      {/* Only the fallback has anything to act on. One button carries its whole
          state: it starts the download, then fills with its progress and offers to
          stop, then offers to remove it. */}
      {speech.backend === "local-model" && (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative mt-2 w-full overflow-hidden",
            promptedForVoice && speech.status !== "present" && "ring-1 ring-primary"
          )}
          onClick={() => {
            if (speech.status === "downloading") speech.cancelDownload();
            else if (speech.status === "present") setConfirmingSpeechRemoval(true);
            else speech.download();
          }}
        >
          {speech.status === "downloading" && (
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 bg-primary/25 transition-[width] duration-200"
              style={{ width: `${speechPercent}%` }}
            />
          )}
          <span className="relative z-10 flex items-center">
            {speech.status === "downloading" ? (
              <>
                <X className="mr-2 h-4 w-4" />
                {t("voiceSearch.cancel", { percent: speechPercent })}
              </>
            ) : speech.status === "present" ? (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("voiceSearch.delete")}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t("voiceSearch.download")}
              </>
            )}
          </span>
        </Button>
      )}
    </div>
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

  // Only the browser's own translator has something to fetch per language. Where
  // one model covers them all, that is said once in the section below instead.
  const perLanguageHint =
    backend === "chrome" ? (
      <p className="px-4 pb-3 text-xs text-muted-foreground">{t("language.packHint")}</p>
    ) : (
      <div className="pb-1" />
    );
  const spokenHint =
    backend === "chrome"
      ? t("language.packHint")
      : t("language.modelHint", { size: modelSizeMb });

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
              <SheetDescription className="sr-only">{spokenHint}</SheetDescription>
            </SheetHeader>
            {perLanguageHint}
            <div className="min-h-0 overflow-y-auto overscroll-contain">
              {list}
              {modelSection}
              {speechSection}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent align="end" className="w-80 overflow-hidden p-0">
            <p className="px-4 pt-4 text-sm font-medium">{t("language.appLanguage")}</p>
            {perLanguageHint}
            {list}
            {modelSection}
            {speechSection}
          </PopoverContent>
        </Popover>
      )}

      <AlertDialog
        open={confirmingModelRemoval}
        onOpenChange={(next) => !next && setConfirmingModelRemoval(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("language.modelDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("language.modelDeleteBody", { size: modelSizeMb })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("language.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void removeModel();
                setConfirmingModelRemoval(false);
              }}
            >
              {t("language.modelDeleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmingSpeechRemoval}
        onOpenChange={(next) => !next && setConfirmingSpeechRemoval(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("voiceSearch.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("voiceSearch.deleteBody", { size: speech.sizeMb })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("language.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void speech.remove();
                setConfirmingSpeechRemoval(false);
              }}
            >
              {t("voiceSearch.deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LanguageSwitcher;
