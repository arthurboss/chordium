import React from "react";
import { X } from "lucide-react";

interface ClearInputButtonProps {
  onClick: () => void;
}

const ClearInputButton: React.FC<ClearInputButtonProps> = ({ onClick }) => (
  <button
    type="button"
    aria-label="Clear input"
    className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive/60 hover:text-destructive focus:outline-hidden bg-card rounded-full border-destructive shadow-xs focus:ring-1 focus:ring-ring"
    onClick={onClick}
    tabIndex={0}
  >
    <X className="h-4 w-4" />
  </button>
);

export default ClearInputButton;
