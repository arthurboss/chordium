import type { ReactNode } from 'react';

export interface PageHeaderProps {
  onBack: () => void;
  onAction?: () => void;
  isSaved?: boolean;
  title?: string;
  artist?: string;
  titleClassName?: string;
  rightContent?: ReactNode;
  metadata?: ReactNode;
}
