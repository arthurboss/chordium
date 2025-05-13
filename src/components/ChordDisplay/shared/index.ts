/**
 * This file exports all reusable components and hooks for chord display
 * Import from this file to ensure you're using optimized, shared components
 */

// Hooks
export { useDropdownTimer } from '../hooks/useDropdownTimer';
export { useScrollPosition } from '../hooks/useScrollPosition';

// Components
export { default as TextPreferences } from '../components/TextPreferences';
export { default as TextPreferencesMenu } from '../components/TextPreferencesMenu';
export { default as TransposeMenu } from '../components/TransposeMenu';
export { default as ViewModeSelector } from '../components/ViewModeSelector';
export { default as FontStyleSelector } from '../components/FontStyleSelector';
export { default as SliderControl } from '../components/SliderControl';
export { default as MobileControlsBar } from '../MobileControlsBar';
export { default as DesktopControls } from '../DesktopControls';
export { default as ChordSheetControls } from '../ChordSheetControls';

// Types re-export
export type {
  TextPreferencesProps,
  TransposeMenuProps,
  ViewModeSelectorProps,
  DropdownMenuBaseProps
} from '../hooks/types';
