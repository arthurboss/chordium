import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { VoiceSearchState } from "@/hooks/useVoiceSearch";
import { cyAttr } from "@/utils/test-utils";

interface VoiceSearchButtonProps {
  state: VoiceSearchState;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

/** Two pulses: the ping cycle is a second, and longer than that starts to nag. */
const JUST_ALLOWED_MS = 2000;

/**
 * Asks for a spoken search, as a segment of the search field itself sitting ahead of
 * submit. It carries the same divider as submit does, so the two read as a pair of
 * things to do with what has been typed rather than one button and one loose icon.
 *
 * Its own state is left to colour and to the icon: muted while a press would open a
 * step of its own rather than the microphone, and red once it is recording.
 */
const VoiceSearchButton = ({ state, onStart, onStop, disabled }: VoiceSearchButtonProps) => {
  const { t } = useTranslation();

  const listening = state === "listening";
  const working = state === "working";
  const needsSetup = state === "needs-setup";
  const needsPermission = state === "needs-permission";

  /**
   * Pulsed once the microphone has just been allowed, because the press that allowed
   * it was not the press that listens: attention is on the system prompt at that
   * moment, and the icon settling from muted to ordinary is easy to return to and
   * miss. It says the next press is the one that hears you.
   */
  const [justAllowed, setJustAllowed] = useState(false);
  const previousState = useRef(state);
  useEffect(() => {
    const wasAwaitingPermission = previousState.current === "needs-permission";
    previousState.current = state;
    if (wasAwaitingPermission && state === "idle") setJustAllowed(true);
    // Pressing it is the point of the hint, so anything but waiting to be pressed
    // ends it early.
    else if (state !== "idle") setJustAllowed(false);
  }, [state]);

  // Timed against the hint rather than the state, so that pressing record while it
  // pulses does not cancel the timer and strand the pulse on forever.
  useEffect(() => {
    if (!justAllowed) return;
    const settle = setTimeout(() => setJustAllowed(false), JUST_ALLOWED_MS);
    return () => clearTimeout(settle);
  }, [justAllowed]);

  const label = (() => {
    if (needsSetup) return t("voiceSearch.setUp");
    if (needsPermission) return t("voiceSearch.allowMicrophone");
    if (listening) return t("voiceSearch.stop");
    if (working) return t("voiceSearch.working");
    return t("voiceSearch.start");
  })();

  return (
    <button
      type="button"
      // Pressed again to finish speaking, which is how a reader says they are done
      // rather than waiting out the cap.
      onClick={listening ? onStop : onStart}
      disabled={disabled || working}
      aria-label={label}
      title={label}
      className={cn(
        // The same segment as submit, divider and all, so the field stays one row.
        "form-field-shell__trailing relative flex w-10 shrink-0 items-center justify-center border-l bg-background hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
        listening
          ? "text-destructive"
          : needsSetup || needsPermission
            ? "text-muted-foreground"
            : "text-foreground"
      )}
      {...cyAttr("voice-search-button")}
    >
      {working ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : listening ? (
        // Filled square rather than a crossed-out microphone: it stops, it does not
        // mute.
        <Square className="h-3.5 w-3.5 fill-current" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {(listening || justAllowed) && (
        <span
          aria-hidden
          className={cn(
            // Inset rather than centred by a translate, because ping animates the
            // transform: a translate here would be dropped the moment it began and
            // the ring would expand from the corner.
            //
            // Inset by a quarter of the segment leaves a ring half its width, so that
            // ping doubling it lands exactly on the segment's own bounds. The field
            // clips whatever leaves it, so a wider ring would expand into a straight
            // edge.
            "absolute inset-2.5 animate-ping rounded-full border motion-reduce:animate-none",
            // Red says recording. Being ready is not an alarm, so it borrows the
            // ordinary accent instead.
            listening ? "border-destructive" : "border-primary"
          )}
        />
      )}
    </button>
  );
};

export default VoiceSearchButton;
