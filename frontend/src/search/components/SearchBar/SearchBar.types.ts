/**
 * Props interface for SearchBar component
 */
import type { VoiceSearchState } from "@/hooks/useVoiceSearch";

export interface SearchBarProps {
  className?: string;
  artistLoading?: boolean;
  loading?: boolean;
  // Current value for the artist input field, controlled by parent component
  artistValue: string;
  // Current value for the song input field, controlled by parent component
  songValue: string;
  // Called whenever either input field changes
  onInputChange: (artist: string, song: string) => void;
  // Called when the search form is submitted
  onSearchSubmit: (artist: string, song: string) => void;
  // Whether to show the back button
  showBackButton?: boolean;
  // Called when the back button is clicked
  onBackClick?: () => void;
  // Whether the search button should be disabled
  isSearchDisabled?: boolean;
  // Add clear search props
  onClearSearch?: () => void;
  clearDisabled?: boolean;
  // Whether the artist input should be disabled (when an artist is selected)
  artistDisabled?: boolean;
  // Where a spoken search has got to. Absent, or "unsupported", hides the button.
  voiceState?: VoiceSearchState;
  // Called to begin listening, or to open the setup offer when nothing is downloaded yet
  onVoiceStart?: () => void;
  // Called to stop listening once the reader has finished speaking
  onVoiceStop?: () => void;
}
