/**
 * Props interface for SearchBar component
 */
import type { VoiceSearchState } from "@/hooks/useVoiceSearch";

export interface SearchBarProps {
  className?: string;
  loading?: boolean;
  /** The search as typed, controlled by the parent component. */
  value: string;
  onInputChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  // Whether the search button should be disabled
  isSearchDisabled?: boolean;
  // Where a spoken search has got to. Absent, or "unsupported", hides the button.
  voiceState?: VoiceSearchState;
  // Called to begin listening, or to open the setup offer when nothing is downloaded yet
  onVoiceStart?: () => void;
  // Called to stop listening once the reader has finished speaking
  onVoiceStop?: () => void;
}
