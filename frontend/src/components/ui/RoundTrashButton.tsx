import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./RoundTrashButton.css";

export interface RoundTrashButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  size?: "default" | "small";
}

const RoundTrashButton: React.FC<RoundTrashButtonProps> = ({ 
  label = "Delete", 
  className = "", 
  disabled, 
  onClick, 
  size = "default",
  ...props 
}) => {
  const sizeClass = size === "small" ? "h-6 w-6 small-icon" : "h-10 w-10";
  return (
    <Button
      type="button"
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      disabled={disabled}
      variant="outline"
      className={`flex justify-center items-center rounded-full text-destructive p-0 ${sizeClass} ${className}`}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </Button>
  );
};

export default RoundTrashButton;
