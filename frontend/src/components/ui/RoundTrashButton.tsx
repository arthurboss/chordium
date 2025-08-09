import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RoundTrashButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 label?: string;
}

/**
 * A generic, accessible, round trash/delete button for UI use.
 *
 * @param label - Accessible label for the button (defaults to "Delete")
 * @param ...props - All other button props (onClick, className, etc.)
 */
const RoundTrashButton: React.FC<RoundTrashButtonProps> = ({ label = "Delete", className = "", disabled, onClick, ...props }) => {
 const enabledClass = "hover:border-red-500/20 text-destructive hover:text-destructive dark:text-red-500 hover:bg-red-100 dark:hover:bg-opacity-40 dark:hover:bg-destructive/30";
 const disabledClass = "text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none";
 return (
  <Button
   type="button"
   aria-label={label}
   aria-disabled={disabled}
   tabIndex={disabled ? -1 : 0}
   disabled={disabled}
   variant="outline"
   className={`flex justify-center items-center h-10 w-10 rounded-full transition-colors duration-300 border-border ${disabled ? disabledClass : enabledClass} ${className}`}
   onClick={disabled ? undefined : onClick}
   {...props}
  >
   <Trash2 className="h-4 center" />
   <span className="sr-only">{label}</span>
  </Button>
 );
};

export default RoundTrashButton;
