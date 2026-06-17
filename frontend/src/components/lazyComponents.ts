import { lazy } from 'react';

// Lazy loaded components
export const LazyStickyControlsBar = lazy(() => import('./ChordDisplay/components/StickyControlsBar'));
export const LazyChordEdit = lazy(() => import('./ChordDisplay/ChordEdit'));

// Add more lazy components as needed
