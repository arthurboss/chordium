import React from "react";
import { Trash2 } from "lucide-react";

interface ClearInputButtonProps {
  onClick: () => void;
}

const ClearInputButton: React.FC<ClearInputButtonProps> = ({ onClick }) => (
  <button
    type="button"
    aria-label="Clear input"
    className="clear-input-button absolute right-3 top-1/2 -translate-y-1/2 p-0 bg-transparent border-0 focus:outline-none transition-colors hover:text-[oklch(0.62_0.24_10)]"
    onClick={onClick}
    tabIndex={0}
  >
    <Trash2 className="h-4 w-4 text-destructive transition-colors" />
  </button>
);

export default ClearInputButton;
