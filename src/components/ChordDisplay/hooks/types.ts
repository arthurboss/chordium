import { ChordSheetControlsProps } from '../types';

/**
 * Common props for dropdown menu components
 */
export interface DropdownMenuBaseProps {
  /** Whether to align the dropdown menu to the bottom of the trigger */
  isAtBottom?: boolean;
  /** Custom class name for the button */
  buttonClassName?: string;
  /** Size of the icon */
  iconSize?: number;
}

/**
 * Props for the ViewModeSelector component
 */
export interface ViewModeSelectorProps {
  /** Current view mode (normal, chords-only, lyrics-only) */
  viewMode: string;
  /** Function to set the view mode */
  setViewMode: (mode: string) => void;
}

/**
 * Props for the TextPreferences component
 */
export interface TextPreferencesProps extends DropdownMenuBaseProps, 
  Pick<ChordSheetControlsProps, 
    'fontSize' | 'setFontSize' | 
    'fontSpacing' | 'setFontSpacing' | 
    'fontStyle' | 'setFontStyle' | 
    'lineHeight' | 'setLineHeight' | 
    'viewMode' | 'setViewMode' | 
    'hideGuitarTabs' | 'setHideGuitarTabs'
  > {}

/**
 * Props for the TransposeMenu component
 */
export interface TransposeMenuProps extends DropdownMenuBaseProps,
  Pick<ChordSheetControlsProps,
    'transpose' | 'setTranspose' | 'transposeOptions'
  > {}
