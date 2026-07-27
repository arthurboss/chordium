import type { ReactNode } from 'react';

export interface PageHeaderProps {
  onBack: () => void;
  onAction?: () => void;
  isSaved?: boolean;
  title?: string;
  artist?: string;
  titleClassName?: string;
  rightContent?: ReactNode;
  onArtistClick?: () => void;
  metadata?: ReactNode;
  // Inline editing of title/artist
  isEditing?: boolean;
  onTitleChange?: (title: string) => void;
  onArtistChange?: (artist: string) => void;
}
