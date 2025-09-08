export interface TextPreferencesMenuProps {
  fontSize: number;
  setFontSize: (value: number) => void;
  fontSpacing: number;
  setFontSpacing: (value: number) => void;
  fontStyle: string;
  setFontStyle: (value: string) => void;
  viewMode: string;
  setViewMode: (value: string) => void;
  hideGuitarTabs?: boolean;
  setHideGuitarTabs?: (value: boolean) => void;
  title?: string;
}
