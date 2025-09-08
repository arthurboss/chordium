import { lazy } from 'react';

// Lazy loaded components
export const LazyChordContent = lazy(() => import('./ChordDisplay/ChordContent'));
export const LazyStickyControlsBar = lazy(() => import('./ChordDisplay/StickyControlsBar'));
export const LazyChordEdit = lazy(() => import('./ChordDisplay/ChordEdit'));
export const LazyConfigMenu = lazy(() => import('./ChordDisplay/ConfigMenu'));

// Add more lazy components as needed
