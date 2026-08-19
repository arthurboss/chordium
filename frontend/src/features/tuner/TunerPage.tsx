import { useTranslation } from "react-i18next";
import { usePitchDetector } from "@/hooks/usePitchDetector";
import { getMicrophoneResetPlatform, type MicrophoneResetPlatform } from "@/services/speech/microphone-permission";
import { GUITAR_TUNINGS } from "@/constants/guitar-tunings";
import TunerNeedle from "./TunerNeedle";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Music } from "lucide-react";

// Octaves for each string of standard tuning, low to high, lined up with
// GUITAR_TUNINGS.STANDARD so the reference card doesn't hardcode note names
// that could drift out of sync with the shared tuning constant.
const STANDARD_OCTAVES = [2, 2, 3, 3, 3, 4];
const STANDARD_STRINGS = GUITAR_TUNINGS.STANDARD.map((note, i) => ({
  stringNumber: 6 - i,
  note,
  octave: STANDARD_OCTAVES[i],
}));

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

const TunerPage = () => {
  const { t } = useTranslation();
  const { status, pitch, start, stop } = usePitchDetector();
  const isListening = status === "listening";
  const isBusy = status === "requesting" || status === "listening";
  const hasNote = pitch.note !== null && pitch.frequency !== null;

  const centsLabel =
    pitch.cents === null
      ? ""
      : pitch.cents === 0
      ? t("tuner.inTune")
      : pitch.cents > 0
      ? t("tuner.sharp", { cents: pitch.cents })
      : t("tuner.flat", { cents: pitch.cents });

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Music className="w-5 h-5 text-primary" aria-hidden />
            <h2 className="text-xl font-semibold">{t("tuner.heading")}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{t("tuner.subtitle")}</p>
        </div>

        {/* Needle display */}
        <div className="flex flex-col items-center gap-2">
          <TunerNeedle cents={pitch.cents} isInTune={!!pitch.isInTune} />

          {/* Note display */}
          <div
            className={`text-center transition-all duration-150 ${
              hasNote ? "opacity-100" : "opacity-30"
            }`}
          >
            <div
              className={`text-7xl font-bold leading-none tracking-tight ${
                pitch.isInTune && hasNote ? "text-green-500" : "text-foreground"
              }`}
              aria-live="polite"
            >
              {hasNote ? pitch.note : "—"}
            </div>
            <div className="text-sm text-muted-foreground mt-1 h-5">
              {hasNote ? (
                <>
                  <span>{pitch.frequency} Hz</span>
                  {pitch.octave !== null && (
                    <span className="ml-2 opacity-60">{t("tuner.octave", { octave: pitch.octave })}</span>
                  )}
                </>
              ) : null}
            </div>
            <div
              className={`text-sm font-medium mt-1 h-5 ${
                pitch.isInTune && hasNote ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              {hasNote ? centsLabel : ""}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3">
          {status === "blocked" && (
            <p className="text-sm text-destructive text-center">
              {t("tuner.blocked")} &middot; {t(RESET_HINTS[getMicrophoneResetPlatform()])}
            </p>
          )}
          {status === "error" && <p className="text-sm text-destructive text-center">{t("tuner.error")}</p>}

          <Button
            size="lg"
            variant={isListening ? "outline" : "default"}
            className="w-40 gap-2"
            disabled={status === "requesting"}
            onClick={isListening ? stop : start}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" aria-hidden />
                {t("tuner.stop")}
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" aria-hidden />
                {t("tuner.start")}
              </>
            )}
          </Button>

          {isBusy && (
            <p className="text-xs text-muted-foreground animate-pulse">
              {status === "requesting" ? t("tuner.requesting") : t("tuner.listening")}
            </p>
          )}
        </div>

        {/* Standard tuning reference */}
        <div className="border rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("tuner.standardTuning")}
          </p>
          <div className="grid grid-cols-6 gap-1 text-center">
            {STANDARD_STRINGS.map(({ stringNumber, note, octave }) => {
              const highlighted = hasNote && pitch.isInTune && pitch.note === note;
              return (
                <div
                  key={stringNumber}
                  className={`rounded p-1.5 text-xs transition-colors ${
                    highlighted
                      ? "bg-green-500/20 text-green-600 dark:text-green-400 font-semibold"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div className="font-medium">
                    {note}
                    {octave}
                  </div>
                  <div className="opacity-60 text-[10px]">{t("tuner.string", { number: stringNumber })}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TunerPage;
