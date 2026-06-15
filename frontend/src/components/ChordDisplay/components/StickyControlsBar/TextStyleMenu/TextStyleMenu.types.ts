export interface TextStyleMenuProps {
  fontSize: number;
  setFontSize: (value: number) => void;
  fontStyle: string;
  setFontStyle: (value: string) => void;
  viewMode: string;
  setViewMode: (value: string) => void;
  hideGuitarTabs?: boolean;
  setHideGuitarTabs?: (value: boolean) => void;
  title?: string;
  // Layout customization props
  variant?: "desktop" | "mobile";
  buttonClassName?: string;
  iconSize?: number;
  // Inline panel control (replaces dropdown)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
