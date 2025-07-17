/**
 * UI constants used across the application
 */

// Helper function to convert rem to pixels - use this for dynamic conversions
// when needed, but prefer pre-calculated constants for performance
export const remToPx = (rem: number): number => {
  // Use the default font size (usually 16px) if we can't access the document
  const baseFontSize = typeof document !== 'undefined' 
    ? parseFloat(getComputedStyle(document.documentElement).fontSize) 
    : 16;
  return rem * baseFontSize;
};

// Baseline font size used for initial calculations
const BASE_FONT_SIZE = 16;

// Pre-calculated pixel values for common rem sizes
const REM_3_PX = 3 * BASE_FONT_SIZE; // 48px with default 16px font size

// Standard card heights for virtualization
export const CARD_HEIGHTS = {
  // Pre-calculated pixel values for virtualized lists
  RESULT_CARD: REM_3_PX,
  // Legacy values - can be refactored to use rem in the future
  SONG_ITEM: 120,
  ARTIST_ITEM: 120,
  ARTIST_GROUP: 300,
};

// If you need to update heights based on current font size (e.g., after user changes settings)
export const updateCardHeights = (): typeof CARD_HEIGHTS => {
  if (typeof document === 'undefined') return CARD_HEIGHTS;
  
  const currentFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  
  return {
    ...CARD_HEIGHTS,
    RESULT_CARD: 3 * currentFontSize,
  };
};
