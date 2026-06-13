import { usePitchDetector } from "@/hooks/usePitchDetector";
import TunerNeedle from "./TunerNeedle";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Music } from "lucide-react";

const NOTE_STANDARD: Record<string, string> = {
  E: "E (1st/6th)",
  B: "B (2nd)",
  G: "G (3rd)",
  D: "D (4th)",
  A: "A (5th)",
};

const TunerPage = () => {
  const { status, pitch, errorMessage, start, stop } = usePitchDetector();
  const isListening = status === "listening";
  const hasNote = pitch.note !== null && pitch.frequency !== null;

  const centsLabel =
    pitch.cents === null
      ? ""
      : pitch.cents === 0
      ? "In tune"
      : pitch.cents > 0
      ? `+${pitch.cents}¢ sharp`
      : `${pitch.cents}¢ flat`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Chromatic Tuner</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Play a string and tune to the nearest note
          </p>
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
                pitch.isInTune && hasNote
                  ? "text-green-500"
                  : "text-foreground"
              }`}
            >
              {hasNote ? pitch.note : "—"}
            </div>
            <div className="text-sm text-muted-foreground mt-1 h-5">
              {hasNote ? (
                <>
                  <span>{pitch.frequency} Hz</span>
                  {pitch.octave !== null && (
                    <span className="ml-2 opacity-60">oct {pitch.octave}</span>
                  )}
                  {NOTE_STANDARD[pitch.note!] && (
                    <span className="ml-2 opacity-60">
                      · {NOTE_STANDARD[pitch.note!]}
                    </span>
                  )}
                </>
              ) : null}
            </div>
            <div
              className={`text-sm font-medium mt-1 h-5 ${
                pitch.isInTune && hasNote
                  ? "text-green-500"
                  : "text-muted-foreground"
              }`}
            >
              {hasNote ? centsLabel : ""}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3">
          {status === "error" && errorMessage && (
            <p className="text-sm text-destructive text-center">{errorMessage}</p>
          )}

          <Button
            size="lg"
            variant={isListening ? "outline" : "default"}
            className="w-40 gap-2"
            onClick={isListening ? stop : start}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Tuner
              </>
            )}
          </Button>

          {isListening && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Listening…
            </p>
          )}
        </div>

        {/* Standard tuning reference */}
        <div className="border rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Standard Tuning
          </p>
          <div className="grid grid-cols-6 gap-1 text-center">
            {[
              { string: "6", note: "E2" },
              { string: "5", note: "A2" },
              { string: "4", note: "D3" },
              { string: "3", note: "G3" },
              { string: "2", note: "B3" },
              { string: "1", note: "E4" },
            ].map(({ string, note }) => {
              const baseNote = note.replace(/\d/, "");
              const highlighted =
                hasNote && pitch.isInTune && pitch.note === baseNote;
              return (
                <div
                  key={string}
                  className={`rounded p-1.5 text-xs transition-colors ${
                    highlighted
                      ? "bg-green-500/20 text-green-600 dark:text-green-400 font-semibold"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div className="font-medium">{note}</div>
                  <div className="opacity-60 text-[10px]">str {string}</div>
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
