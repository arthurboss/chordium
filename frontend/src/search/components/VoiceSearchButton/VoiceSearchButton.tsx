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

  const label = (() => {
    if (needsSetup) return t("voiceSearch.setUp");
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
        needsSetup && "border-dashed text-muted-foreground"
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
      {listening && (
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full border border-destructive"
        />
      )}
    </Button>
  );
};

export default VoiceSearchButton;
