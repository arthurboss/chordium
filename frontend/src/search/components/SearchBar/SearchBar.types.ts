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
  // Whether to show the back button
  showBackButton?: boolean;
  // Called when the back button is clicked
  onBackClick?: () => void;
  // Whether the search button should be disabled
  isSearchDisabled?: boolean;
  // Add clear search props
  onClearSearch?: () => void;
  clearDisabled?: boolean;
  // Where a spoken search has got to. Absent, or "unsupported", hides the button.
  voiceState?: VoiceSearchState;
  // Called to begin listening, or to open the setup offer when nothing is downloaded yet
  onVoiceStart?: () => void;
  // Called to stop listening once the reader has finished speaking
  onVoiceStop?: () => void;
}
