import { ReactNode } from "react";

export interface NavigationCardProps {
  onBack: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  className?: string;
  children?: ReactNode;
}
