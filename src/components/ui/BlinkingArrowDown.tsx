import React from "react";

interface BlinkingArrowDownProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
  label?: string;
}

const BlinkingArrowDown: React.FC<BlinkingArrowDownProps> = ({
  size = 36,
  color = "#666",
  style = {},
  className = "",
  label = "Loading more results",
}) => (
  <span
    className={`animate-pulse font-bold select-none leading-none ${className}`}
    style={{
      fontSize: size,
      color,
      ...style,
    }}
    aria-label={label}
  >
    &#8595;
  </span>
);

export default BlinkingArrowDown;
