/**
 * KeyMenu component constants
 */

export const KEY_MENU_STYLES = {
  container: "flex items-center justify-between h-8 w-full bg-background border rounded-lg px-2",
  decrementButton: "h-6 w-4 p-0 text-primary hover:text-primary flex-shrink-0",
  incrementButton: "h-6 w-4 p-0 text-primary hover:text-primary flex-shrink-0",
  displayContainer: "flex items-center justify-center flex-1 px-2 min-w-0",
  displayInner: "flex items-center gap-1",
  keyName: "font-medium text-sm text-foreground",
  transposeText: "font-medium text-xs text-muted-foreground",
  resetButton: "h-6 w-6 p-0 text-red-500 hover:text-red-500 flex-shrink-0",
  buttonText: "text-sm font-medium",
  verticalDivider: "h-4 w-px bg-border mx-1 flex-shrink-0"
} as const;

export const KEY_MENU_LABELS = {
  decrement: "−",
  increment: "+",
  reset: "×",
  resetTitle: "Reset to original key"
} as const;
