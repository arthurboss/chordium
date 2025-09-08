/**
 * TextStyleMenu component constants
 */

export const TEXT_PREFERENCES_LABELS = {
  textPreferences: "Style",
  viewMode: "View Mode",
  fontStyle: "Font Style",
  fontSize: "Font Size",
  fontSpacing: "Font Spacing",
  serif: "Serif",
  sansSerif: "Sans",
  normal: "Normal",
  chords: "Chords",
  lyrics: "Lyrics"
} as const;

export const TEXT_PREFERENCES_VALUES = {
  fontSizes: {
    min: 12,
    max: 24,
    step: 1
  },
  fontSpacing: {
    min: 0,
    max: 0.2,
    step: 0.1
  },
  spacingMultipliers: {
    0: 'x1',
    0.1: 'x2',
    0.2: 'x3'
  }
} as const;
