import { lazy } from 'react';

// Lazy loaded components
export const LazyChordContent = lazy(() => import('./ChordDisplay/ChordContent'));
export const LazyChordSheetControls = lazy(() => import('./ChordDisplay/ChordSheetControls'));
export const LazyChordEdit = lazy(() => import('./ChordDisplay/ChordEdit'));
export const LazyConfigMenu = lazy(() => import('./ChordDisplay/ConfigMenu'));
export const LazyMobileControlsBar = lazy(() => import('./ChordDisplay/MobileControlsBar'));
export const LazyDesktopControls = lazy(() => import('./ChordDisplay/DesktopControls'));

// Add more lazy components as needed
