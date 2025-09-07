export interface NavigationCardProps {
  onBack: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  onSave?: () => void;
  showSaveButton?: boolean;
  className?: string;
  title?: string;
}
