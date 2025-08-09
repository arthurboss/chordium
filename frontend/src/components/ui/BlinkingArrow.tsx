import React from "react";

interface BlinkingArrowProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
  label?: string;
  direction?: "down" | "right" | "left" | "up";
}

const arrowMap = {
  down: "\u2193",
  right: "\u2192",
  left: "\u2190",
  up: "\u2191",
};

const BlinkingArrow: React.FC<BlinkingArrowProps> = ({
  size = 36,
  color = "primary/90",
  style = {},
  className = "",
  label = "Loading more results",
  direction = "down",
}) => (
  <span
    className={` font-bold select-none leading-none ${className} text-${color}`}
    style={{
      fontSize: size,
      ...style,
    }}
    aria-label={label}
  >
    {arrowMap[direction]}
  </span>
);

export default BlinkingArrow;
