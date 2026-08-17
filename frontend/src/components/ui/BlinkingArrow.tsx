import React from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

interface BlinkingArrowProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
  label?: string;
  direction?: "down" | "right" | "left" | "up";
}

// Just the head, no shaft - a chevron rather than a full arrow glyph.
const iconMap = {
  down: ChevronDown,
  right: ChevronRight,
  left: ChevronLeft,
  up: ChevronUp,
};

const BlinkingArrow: React.FC<BlinkingArrowProps> = ({
  size = 24,
  color = "primary/90",
  style = {},
  className = "",
  label = "Loading more results",
  direction = "down",
}) => {
  const Icon = iconMap[direction];
  return (
    <Icon
      className={`select-none text-${color} ${className}`}
      style={style}
      size={size}
      strokeWidth={3}
      aria-label={label}
    />
  );
};

export default BlinkingArrow;
