import React from "react";
import { X } from "lucide-react";

interface ClearInputButtonProps {
  onClick: () => void;
}

const ClearInputButton: React.FC<ClearInputButtonProps> = ({ onClick }) => (
  <button
    type="button"
    aria-label="Clear input"
    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none bg-muted/60 hover:bg-muted px-0.5 py-0.5 rounded-full border border-border shadow-sm"
    onClick={onClick}
    tabIndex={0}
  >
    <X className="h-4 w-4" />
  </button>
);

export default ClearInputButton;
