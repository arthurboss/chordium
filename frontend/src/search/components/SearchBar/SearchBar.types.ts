/**
 * Props interface for SearchBar component
 */
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
}
