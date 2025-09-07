export interface NavigationCardProps {
  onBack: () => void;
  onAction?: () => void; // Unified callback for both save and delete actions
  isSaved?: boolean; // If true, shows delete button; if false, shows save button; if undefined, shows neither
  title?: string;
}
