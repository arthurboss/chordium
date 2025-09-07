/**
 * TextPreferencesMenu component constants
 */

export const TEXT_PREFERENCES_STYLES = {
  triggerButton: "h-8 px-2 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-0",
  settingsIcon: "text-chord",
  buttonText: "font-medium text-sm",
  dropdownContent: "align-end",
  sectionContainer: "px-2 py-1",
  sectionTitle: "font-semibold text-xs mb-1",
  buttonGroup: "flex items-center gap-2",
  viewModeButton: "min-w-[40px] flex items-center justify-center",
  fontStyleButton: "min-w-[60px]",
  sliderSection: "px-2 py-3",
  sliderContainer: "flex items-center gap-3",
  slider: "w-32",
  valueDisplay: "w-10 text-center text-sm"
} as const;

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
