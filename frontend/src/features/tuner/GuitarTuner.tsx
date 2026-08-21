import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Guitar, Loader2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePitchDetector } from "@/hooks/usePitchDetector";
import { getMicrophoneResetPlatform, type MicrophoneResetPlatform } from "@/services/speech/microphone-permission";
import { cn } from "@/lib/utils";
import TunerNeedle from "./TunerNeedle";

// Which notification copy explains how to undo a refused microphone, by
// platform. Reused as-is from the voice-search feature (useVoiceSearch.ts) -
// the instructions are about the browser's permission UI, not about voice
// search, so they read the same for a tuner.
const RESET_HINTS: Record<MicrophoneResetPlatform, string> = {
  ios: "notifications:voiceMicrophoneBlockedIos",
  safari: "notifications:voiceMicrophoneBlockedSafari",
  android: "notifications:voiceMicrophoneBlockedAndroid",
  chrome: "notifications:voiceMicrophoneBlockedChrome",
  firefox: "notifications:voiceMicrophoneBlockedFirefox",
  generic: "notifications:voiceMicrophoneBlockedGeneric",
};

interface GuitarTunerProps {
  trigger?: ReactNode;
  /**
   * Lets a caller drive the panel from outside instead of via its own
   * trigger - needed when the trigger lives inside something that unmounts
   * on click (the burger menu's own sheet/popover), which would otherwise
   * tear this component down together with whatever it just opened.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A CifraClub-style tuner: a small popup rather than a page, listening as
 * soon as it opens and letting go of the microphone as soon as it closes.
 * Follows the app's own light/dark theme rather than forcing one, and its
 * border/tint carries the tuning feedback instead of a separate status line.
 */
const GuitarTuner = ({ trigger: triggerOverride, open: openProp, onOpenChange }: GuitarTunerProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;
  const { status, pitch, start, stop, devices, selectedDeviceId, selectDevice } = usePitchDetector();

  const isListening = status === "listening";
  const hasNote = pitch.note !== null && pitch.frequency !== null;
  const inTune = hasNote && !!pitch.isInTune;

  useEffect(() => {
    if (open) void start();
    else stop();
  }, [open, start, stop]);

  const panel = (className?: string) => (
    <div className={cn("space-y-4 px-4 py-6", className)}>
      <div
        className={cn(
          "flex flex-col items-center gap-4 rounded-md border-2 bg-background/80 p-6 text-foreground transition-colors duration-300 dark:bg-card",
          inTune
            ? "border-green-500 bg-green-50 dark:bg-green-950"
            : isListening
              ? "border-primary"
              : "border-border"
        )}
      >
        <TunerNeedle cents={pitch.cents} isInTune={inTune} />

        <div className={cn("text-center transition-opacity duration-150", hasNote ? "opacity-100" : "opacity-40")}>
          <div
            className={cn(
              "text-7xl font-bold leading-none tracking-tight",
              inTune ? "text-green-600 dark:text-green-400" : "text-foreground"
            )}
            aria-live="polite"
          >
            {pitch.note ?? "—"}
          </div>
          <div className="mt-1 h-5 text-sm text-muted-foreground">
            {pitch.frequency !== null ? `${pitch.frequency} Hz` : "— Hz"}
          </div>
        </div>

        {status === "blocked" && (
          <p className="text-center text-sm text-destructive">
            {t("tuner.blocked")} &middot; {t(RESET_HINTS[getMicrophoneResetPlatform()])}
          </p>
        )}
        {status === "error" && <p className="text-center text-sm text-destructive">{t("tuner.error")}</p>}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "relative h-10 w-10 rounded-full",
            isListening ? "border-destructive text-destructive hover:text-destructive" : "text-muted-foreground"
          )}
          disabled={status === "requesting"}
          onClick={isListening ? stop : () => void start(selectedDeviceId ?? undefined)}
          aria-label={t(isListening ? "tuner.stop" : "tuner.start")}
        >
          {status === "requesting" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {isListening && (
            <span
              aria-hidden
              className="absolute inset-1.5 animate-ping rounded-full border border-destructive motion-reduce:animate-none"
            />
          )}
        </Button>

        {devices.length > 1 && (
          <Select value={selectedDeviceId ?? undefined} onValueChange={selectDevice}>
            <SelectTrigger
              className="h-10 w-auto max-w-[14rem] gap-2 rounded-md ring-inset focus:ring-offset-0"
              aria-label={t("tuner.selectMicrophone")}
            >
              <SelectValue placeholder={t("tuner.selectMicrophone")} />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device, index) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || t("tuner.microphoneFallbackLabel", { number: index + 1 })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );

  const defaultTrigger = (
    <Button
      variant="outline"
      size="icon"
      aria-label={t("header.tunerAriaLabel")}
      title={t("header.tunerAriaLabel")}
      className="h-10 w-10 rounded-full"
    >
      <Guitar className="h-4 w-4" />
    </Button>
  );
  const trigger = isControlled ? null : triggerOverride ?? defaultTrigger;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent
          side="bottom"
          className="flex max-h-[92dvh] flex-col gap-0 rounded-t-xl px-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
        >
          <SheetHeader className="shrink-0 px-4 text-left">
            <SheetTitle>{t("header.tunerAriaLabel")}</SheetTitle>
            <SheetDescription className="sr-only">{t("tuner.subtitle")}</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 overflow-y-auto overscroll-contain">{panel()}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent animation="fade" className="w-auto overflow-hidden p-0 sm:max-w-none">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("header.tunerAriaLabel")}</DialogTitle>
          <DialogDescription>{t("tuner.subtitle")}</DialogDescription>
        </DialogHeader>
        {panel("pt-11")}
      </DialogContent>
    </Dialog>
  );
};

export default GuitarTuner;
