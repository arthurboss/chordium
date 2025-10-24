import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge tailwind classes
 * Re-exported from the main utils to avoid circular dependencies
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Common dropdown menu animation classes
 */
export const dropdownAnimationClasses = {
  base: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  sides: "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
};

/**
 * Common dropdown menu style classes
 */
export const dropdownStyleClasses = {
  content: "z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground",
  item: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
  insetItem: "pl-8",
  indicator: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
  label: "px-2 py-1.5 text-sm font-semibold",
  separator: "-mx-1 my-1 h-px bg-muted",
};
