import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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
 * Asks for a spoken search. Its look says what pressing it will do: dashed while
 * something still has to be downloaded, since that press opens the offer rather
 * than the microphone.
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
   * moment, and the button going quietly from dashed to solid is easy to return to
   * and miss. It says the next press is the one that hears you.
   */
  const [justAllowed, setJustAllowed] = useState(false);
  const previousState = useRef(state);
  useEffect(() => {
    const wasAwaitingPermission = previousState.current === "needs-permission";
    previousState.current = state;
    if (!wasAwaitingPermission || state !== "idle") return;
    setJustAllowed(true);
    const settle = setTimeout(() => setJustAllowed(false), JUST_ALLOWED_MS);
    return () => clearTimeout(settle);
  }, [state]);

  const label = (() => {
    if (needsSetup) return t("voiceSearch.setUp");
    if (needsPermission) return t("voiceSearch.allowMicrophone");
    if (listening) return t("voiceSearch.stop");
    if (working) return t("voiceSearch.working");
    return t("voiceSearch.start");
  })();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "relative h-10 w-10 rounded-full",
        listening && "border-destructive text-destructive",
        // Dashed for both, because both mean the press opens a step of its own rather
        // than the microphone.
        (needsSetup || needsPermission) && "border-dashed text-muted-foreground"
      )}
      // Pressed again to finish speaking, which is how a reader says they are done
      // rather than waiting out the cap.
      onClick={listening ? onStop : onStart}
      disabled={disabled || working}
      aria-label={label}
      title={label}
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
            // Decorative, and the state is already carried by the icon and the border,
            // so a reader who asked for less movement loses nothing by it stopping.
            "absolute inset-0 animate-ping rounded-full border motion-reduce:animate-none",
            // Red says recording. Being ready is not an alarm, so it borrows the
            // ordinary accent instead.
            listening ? "border-destructive" : "border-primary"
          )}
        />
      )}
    </Button>
  );
};

export default VoiceSearchButton;
