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
  const blocked = state === "blocked";

  const label = (() => {
    if (needsSetup) return t("voiceSearch.setUp");
    if (needsPermission) return t("voiceSearch.allowMicrophone");
    if (blocked) return t("voiceSearch.blocked");
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
          : needsSetup || needsPermission || blocked
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
      {listening && (
        <span
          aria-hidden
          // Kept for recording alone. It once said "ready" too, in another colour, but
          // a ring pulsing beside a microphone reads as live whatever colour it is,
          // and saying "ready" and "recording" the same way left a reader who did not
          // already know the app unable to tell which was which. Being ready is said
          // in words now.
          //
          // Inset rather than centred by a translate, because ping animates the
          // transform: a translate here would be dropped the moment it began and the
          // ring would expand from the corner. Inset by a quarter of the segment
          // leaves a ring half its width, so that ping doubling it lands exactly on
          // the segment's own bounds; the field clips whatever leaves it, so a wider
          // ring would expand into a straight edge.
          className="absolute inset-2.5 animate-ping rounded-full border border-destructive motion-reduce:animate-none"
        />
      )}
    </button>
  );
};

export default VoiceSearchButton;
