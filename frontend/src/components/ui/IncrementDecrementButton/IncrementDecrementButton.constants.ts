export const INCREMENT_DECREMENT_BUTTON_STYLES = {
  container: "flex items-center justify-between h-6 w-[100px] sm:w-[110px] bg-card border rounded-md px-1",
  decrementButton: "h-5 w-3 p-0 text-primary hover:text-foreground hover:bg-transparent flex-shrink-0 transition-colors duration-200",
  incrementButton: "h-5 w-3 p-0 text-primary hover:text-foreground hover:bg-transparent flex-shrink-0 transition-colors duration-200",
  resetButton: "h-5 w-5 p-0 text-destructive/50 hover:text-destructive flex-shrink-0 transition-colors duration-200",
  verticalDivider: "h-3 w-px bg-border mx-0.5 flex-shrink-0",
  displayContainer: "flex items-center justify-center flex-1 min-w-0 overflow-hidden relative h-5",
  displayInner: "flex items-center justify-center gap-1 relative w-full h-full",
  buttonText: "text-xs font-medium",
  lockWheel: "h-full transition-transform duration-300 ease-in-out",
  digitsContainer: "flex flex-col",
  digit: "h-5 flex items-center justify-center font-medium text-xs text-foreground",
  // Static display styles for complex values (like musical keys)
  staticDisplay: "flex items-center gap-1",
  staticMainText: "font-medium text-xs text-foreground",
  staticSubText: "font-medium text-xs text-muted-foreground",
  // Slide transition styles - using Tailwind animations
  slideContainer: "relative h-full w-full overflow-hidden",
  slideText: "absolute inset-0 flex items-center justify-center font-medium text-xs text-foreground",
  slideTextUp: "animate-in slide-in-from-bottom duration-200",
  slideTextDown: "animate-in slide-in-from-top duration-200",
  disabledButton: "h-5 w-3 p-0 text-muted-foreground cursor-not-allowed flex-shrink-0 transition-colors duration-200",
  disabledResetButton: "h-5 w-5 p-0 text-muted-foreground cursor-not-allowed flex-shrink-0 transition-colors duration-200"
} as const;

export const INCREMENT_DECREMENT_BUTTON_LABELS = {
  increment: '+',
  decrement: '−',
  resetTitle: 'Reset to default'
} as const;
