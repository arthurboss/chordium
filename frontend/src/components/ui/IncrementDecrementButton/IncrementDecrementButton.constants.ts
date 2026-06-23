export const INCREMENT_DECREMENT_BUTTON_STYLES = {
  container: "flex items-center justify-between h-6 w-[100px] sm:w-[110px] bg-card/75 rounded-md px-1",
  decrementButton: "h-5 w-3 p-0 flex-shrink-0 border-none",
  incrementButton: "h-5 w-3 p-0 flex-shrink-0 border-none",
  resetButton: "h-5 w-5 p-0 flex-shrink-0 border-none",
  verticalDivider: "h-3 w-px bg-border mx-0.5 flex-shrink-0",
  displayContainer: "flex items-center justify-center flex-1 min-w-0 overflow-hidden relative h-5",
  displayInner: "flex items-center justify-center gap-1 relative w-full h-full",
  buttonText: "text-xs font-medium",
  lockWheel: "h-full transition-transform duration-300 ease-in-out",
  digitsContainer: "flex flex-col",
  digit: "h-5 flex items-center justify-center font-medium text-xs text-foreground",
  staticDisplay: "flex items-center gap-1",
  staticMainText: "font-medium text-xs text-foreground",
  staticSubText: "font-medium text-xs text-muted-foreground",
  slideContainer: "relative h-full w-full overflow-hidden",
  slideText: "absolute inset-0 flex items-center justify-center font-medium text-xs text-foreground",
  slideTextUp: "animate-in slide-in-from-bottom duration-200",
  slideTextDown: "animate-in slide-in-from-top duration-200",
  disabledButton: "h-5 w-3 p-0 flex-shrink-0 border-none",
  disabledResetButton: "h-5 w-5 p-0 flex-shrink-0 border-none"
} as const;

export const INCREMENT_DECREMENT_BUTTON_LABELS = {
  increment: '+',
  decrement: '−',
  resetTitle: 'Reset to default'
} as const;
