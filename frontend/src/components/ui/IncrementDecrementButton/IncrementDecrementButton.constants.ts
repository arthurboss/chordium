export const INCREMENT_DECREMENT_BUTTON_STYLES = {
  container: "flex items-center justify-between h-8 w-28 sm:w-32 bg-background border rounded-lg px-2",
  decrementButton: "h-6 w-4 p-0 text-primary hover:text-foreground hover:bg-transparent shrink-0 transition-colors duration-200",
  incrementButton: "h-6 w-4 p-0 text-primary hover:text-foreground hover:bg-transparent shrink-0 transition-colors duration-200",
  resetButton: "h-6 w-6 p-0 text-red-500 hover:text-red-500 shrink-0 transition-colors duration-200",
  verticalDivider: "h-4 w-px bg-border mx-1 shrink-0",
  displayContainer: "flex items-center justify-center flex-1 min-w-0 overflow-hidden relative h-6",
  displayInner: "flex items-center justify-center gap-1 relative w-full h-full",
  buttonText: "text-xs sm:text-sm font-medium",
  lockWheel: "h-full transition-transform duration-300 ease-in-out",
  digitsContainer: "flex flex-col",
  digit: "h-6 flex items-center justify-center font-medium text-xs sm:text-sm text-foreground",
  // Static display styles for complex values (like musical keys)
  staticDisplay: "flex items-center gap-1",
  staticMainText: "font-medium text-xs sm:text-sm text-foreground",
  staticSubText: "font-medium text-xs sm:text-sm text-muted-foreground",
  // Slide transition styles - using Tailwind animations
  slideContainer: "relative h-full w-full overflow-hidden",
  slideText: "absolute inset-0 flex items-center justify-center font-medium text-xs sm:text-sm text-foreground",
  slideTextUp: "animate-in slide-in-from-bottom duration-200",
  slideTextDown: "animate-in slide-in-from-top duration-200",
  disabledButton: "h-6 w-4 p-0 text-muted-foreground cursor-not-allowed shrink-0 transition-colors duration-200",
  disabledResetButton: "h-6 w-6 p-0 text-muted-foreground cursor-not-allowed shrink-0 transition-colors duration-200"
} as const;

export const INCREMENT_DECREMENT_BUTTON_LABELS = {
  increment: '+',
  decrement: '−',
  resetTitle: 'Reset to default'
} as const;
