/**
 * TextStyleMenu component styles
 */

export const TEXT_STYLE_MENU_STYLES = {
  triggerButton: "h-10 w-10 rounded-full flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-0 hover:text-primary",
  settingsIcon: "text-foreground",
  buttonText: "font-medium text-sm",
  dropdownContent: "align-end",
  sectionContainer: "px-2 py-1",
  sectionTitle: "font-semibold text-xs mb-2",
  buttonGroup: "flex items-center gap-2",
  viewModeButton: "min-w-[40px] flex items-center justify-center",
  fontStyleButton: "min-w-[60px]",
  sliderSection: "px-1 py-1",
  sliderContainer: "flex items-center gap-1",
  slider: "w-32",
  valueDisplay: "w-10 text-center text-sm"
} as const;
